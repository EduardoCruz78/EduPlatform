namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TopicsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TopicsController(AppDbContext db) => _db = db;

    // GET /api/topics
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Topics
            .AsNoTracking()
            .Include(t => t.TopicSubjects)
                .ThenInclude(ts => ts.Subject)
                    .ThenInclude(s => s.Series)
            .ToListAsync();

        var dto = list.Select(t => new
        {
            id = t.Id,
            name = t.Name,
            // pega o primeiro subjectId caso exista (útil para formulários que vinculam 1 matéria)
            subjectId = t.TopicSubjects.Select(ts => ts.SubjectId).FirstOrDefault(),
            // lista completa de matérias relacionadas (id, name, seriesId)
            subjects = t.TopicSubjects.Select(ts => new
            {
                id = ts.Subject.Id,
                name = ts.Subject.Name,
                seriesId = ts.Subject.SeriesId
            }).ToList()
        });

        return Ok(dto);
    }

    // GET /api/topics/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var topic = await _db.Topics
            .AsNoTracking()
            .Include(t => t.TopicSubjects)
                .ThenInclude(ts => ts.Subject)
                    .ThenInclude(s => s.Series)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (topic == null) return NotFound();

        var dto = new
        {
            id = topic.Id,
            name = topic.Name,
            subjectId = topic.TopicSubjects.Select(ts => ts.SubjectId).FirstOrDefault(),
            subjects = topic.TopicSubjects.Select(ts => new
            {
                id = ts.Subject.Id,
                name = ts.Subject.Name,
                seriesId = ts.Subject.SeriesId
            }).ToList()
        };

        return Ok(dto);
    }

    // POST /api/topics
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TopicCreateDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("O nome do tópico é obrigatório.");

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var topic = new Topic { Name = dto.Name.Trim() };
            _db.Topics.Add(topic);
            await _db.SaveChangesAsync();

            var subjectIds = new List<int>();
            if (dto.SubjectId.HasValue) subjectIds.Add(dto.SubjectId.Value);
            if (dto.SubjectIds != null && dto.SubjectIds.Any()) subjectIds.AddRange(dto.SubjectIds);
            subjectIds = subjectIds.Distinct().ToList();

            if (subjectIds.Any())
            {
                var existing = await _db.Subjects.Where(s => subjectIds.Contains(s.Id)).Select(s => s.Id).ToListAsync();
                foreach (var sid in existing)
                {
                    _db.TopicSubjects.Add(new TopicSubject { TopicId = topic.Id, SubjectId = sid });
                }
                await _db.SaveChangesAsync();
            }

            await tx.CommitAsync();
            return CreatedAtAction(nameof(Get), new { id = topic.Id }, new { id = topic.Id, name = topic.Name });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            Console.Error.WriteLine($"[TopicsController.Create] Erro: {ex}");
            return Problem($"Erro ao criar tópico: {ex.Message}");
        }
    }

    // PUT /api/topics/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] TopicCreateDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name)) return BadRequest();

        var topic = await _db.Topics.FindAsync(id);
        if (topic == null) return NotFound();

        topic.Name = dto.Name.Trim();
        _db.Topics.Update(topic);
        await _db.SaveChangesAsync();

        if (dto.SubjectId.HasValue || (dto.SubjectIds != null && dto.SubjectIds.Any()))
        {
            var newIds = new List<int>();
            if (dto.SubjectId.HasValue) newIds.Add(dto.SubjectId.Value);
            if (dto.SubjectIds != null) newIds.AddRange(dto.SubjectIds);
            newIds = newIds.Distinct().ToList();

            var oldJoins = await _db.TopicSubjects.Where(ts => ts.TopicId == id).ToListAsync();
            _db.TopicSubjects.RemoveRange(oldJoins);
            await _db.SaveChangesAsync();

            var exist = await _db.Subjects.Where(s => newIds.Contains(s.Id)).Select(s => s.Id).ToListAsync();
            foreach (var sid in exist)
            {
                _db.TopicSubjects.Add(new TopicSubject { TopicId = id, SubjectId = sid });
            }
            await _db.SaveChangesAsync();
        }

        return Ok(new { id = topic.Id, name = topic.Name });
    }

    // DELETE /api/topics/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var topic = await _db.Topics.FindAsync(id);
            if (topic == null) return NotFound();

            var joins = await _db.TopicSubjects.Where(ts => ts.TopicId == id).ToListAsync();
            if (joins.Any())
            {
                _db.TopicSubjects.RemoveRange(joins);
                await _db.SaveChangesAsync();
            }

            var contents = await _db.Contents.Where(c => c.TopicId == id).ToListAsync();
            if (contents.Any())
            {
                _db.Contents.RemoveRange(contents);
                await _db.SaveChangesAsync();
            }

            _db.Topics.Remove(topic);
            await _db.SaveChangesAsync();

            await tx.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            Console.Error.WriteLine($"[TopicsController.Delete] Erro: {ex}");
            return Problem($"Erro ao deletar tópico: {ex.Message}");
        }
    }

    // GET /api/topics/{id}/contents
    [HttpGet("{id:int}/contents")]
    public async Task<IActionResult> GetContents(int id)
    {
        var contents = await _db.Contents
            .AsNoTracking()
            .Where(c => c.TopicId == id)
            .Select(c => new {
                id = c.Id,
                title = c.Title,
                type = c.Type,
                link = c.Link,
                thumbnailUrl = c.ThumbnailUrl,
                pdfUrl = c.PdfUrl   // <-- incluído
            })
            .ToListAsync();

        return Ok(contents);
    }

}
