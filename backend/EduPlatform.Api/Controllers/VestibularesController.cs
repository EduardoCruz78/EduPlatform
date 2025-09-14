

namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/vestibulares")]
public class VestibularesController : ControllerBase
{
    private readonly AppDbContext _db;
    public VestibularesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // materializa primeiro (evita ambiguidades de Select/ToListAsync)
        var list = await _db.Vestibulares
            .AsNoTracking()
            .ToListAsync();

        var dto = list.Select(v => new VestibularDto
        {
            Id = v.Id,
            Name = v.Name,
            Date = v.Date,
            Description = v.Description,
            Url = v.Url
        }).ToList();

        return Ok(dto);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var v = await _db.Vestibulares.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (v == null) return NotFound();
        return Ok(new VestibularDto { Id = v.Id, Name = v.Name, Date = v.Date, Description = v.Description, Url = v.Url });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] VestibularCreateDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name)) return BadRequest();
        var v = new Vestibular { Name = dto.Name.Trim(), Date = dto.Date, Description = dto.Description, Url = dto.Url };
        _db.Vestibulares.Add(v);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = v.Id }, new VestibularDto { Id = v.Id, Name = v.Name, Date = v.Date, Description = v.Description, Url = v.Url });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var v = await _db.Vestibulares.FindAsync(id);
        if (v == null) return NotFound();
        _db.Vestibulares.Remove(v);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/vestibulares/{id}/subjects
    [HttpGet("{id:int}/subjects")]
    public async Task<IActionResult> GetSubjects(int id)
    {
        var vestibular = await _db.Vestibulares
            .AsNoTracking()
            .Include(v => v.VestibularSubjects)
                .ThenInclude(vs => vs.Subject)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vestibular == null) return NotFound();

        var subjects = vestibular.VestibularSubjects
            .Where(vs => vs.Subject != null)
            .Select(vs => new { id = vs.Subject.Id, name = vs.Subject.Name })
            .ToList();

        return Ok(subjects);
    }

    // POST /api/vestibulares/{id}/subjects  body: { subjectId: 123 }
    [HttpPost("{id:int}/subjects")]
    public async Task<IActionResult> AddSubject(int id, [FromBody] dynamic body)
    {
        if (body == null) return BadRequest();
        int subjectId;
        try { subjectId = (int)body.subjectId; } catch { return BadRequest("subjectId required"); }

        var vestibular = await _db.Vestibulares.FindAsync(id);
        var subject = await _db.Subjects.FindAsync(subjectId);
        if (vestibular == null || subject == null) return NotFound();

        var exists = await _db.VestibularSubjects.AnyAsync(x => x.VestibularId == id && x.SubjectId == subjectId);
        if (exists) return Conflict();

        _db.VestibularSubjects.Add(new VestibularSubject { VestibularId = id, SubjectId = subjectId });
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/vestibulares/{id}/subjects/{subjectId}
    [HttpDelete("{id:int}/subjects/{subjectId:int}")]
    public async Task<IActionResult> RemoveSubject(int id, int subjectId)
    {
        var join = await _db.VestibularSubjects.FirstOrDefaultAsync(x => x.VestibularId == id && x.SubjectId == subjectId);
        if (join == null) return NotFound();
        _db.VestibularSubjects.Remove(join);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/vestibulares/{id}/contents
    [HttpGet("{id:int}/contents")]
    public async Task<IActionResult> GetContents(int id)
    {
        var contents = await _db.VestibularContents
            .AsNoTracking()
            .Where(c => c.VestibularId == id)
            .Select(c => new VestibularContentDto
            {
                Id = c.Id,
                Title = c.Title,
                Type = c.Type,
                Link = c.Link,
                PdfUrl = c.PdfUrl,
                VestibularId = c.VestibularId
            })
            .ToListAsync();

        return Ok(contents);
    }

    // POST /api/vestibulares/{id}/contents
    [HttpPost("{id:int}/contents")]
    public async Task<IActionResult> AddContent(int id, [FromBody] VestibularContentCreateDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Title)) return BadRequest();

        var vestibular = await _db.Vestibulares.FindAsync(id);
        if (vestibular == null) return NotFound();

        VestibularContent vc = new VestibularContent
        {
            Title = dto.Title.Trim(),
            Type = string.IsNullOrWhiteSpace(dto.Type) ? null : dto.Type.Trim(),
            Link = dto.Link,
            PdfUrl = dto.PdfUrl,
            VestibularId = id
        };

        if (dto.OriginalContentId.HasValue)
        {
            var orig = await _db.Contents.FindAsync(dto.OriginalContentId.Value);
            if (orig != null)
            {
                vc.OriginalContentId = orig.Id;
                if (string.IsNullOrWhiteSpace(vc.Link) && !string.IsNullOrWhiteSpace(orig.Link)) vc.Link = orig.Link;
                if (string.IsNullOrWhiteSpace(vc.PdfUrl) && !string.IsNullOrWhiteSpace(orig.PdfUrl)) vc.PdfUrl = orig.PdfUrl;
            }
        }

        _db.VestibularContents.Add(vc);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetContents), new { id = id }, new VestibularContentDto
        {
            Id = vc.Id,
            Title = vc.Title,
            Type = vc.Type,
            Link = vc.Link,
            PdfUrl = vc.PdfUrl,
            VestibularId = vc.VestibularId
        });
    }

    // POST /api/vestibulares/{id}/contents/share  body: { contentId }
    [HttpPost("{id:int}/contents/share")]
    public async Task<IActionResult> ShareExistingContent(int id, [FromBody] ShareContentDto dto)
    {
        if (dto == null) return BadRequest();
        var vestibular = await _db.Vestibulares.FindAsync(id);
        var content = await _db.Contents.FindAsync(dto.ContentId);
        if (vestibular == null || content == null) return NotFound();

        var vc = new VestibularContent
        {
            Title = content.Title,
            Type = content.Type,
            Link = content.Link,
            PdfUrl = content.PdfUrl,
            VestibularId = id,
            OriginalContentId = content.Id
        };

        _db.VestibularContents.Add(vc);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetContents), new { id = id }, new VestibularContentDto
        {
            Id = vc.Id,
            Title = vc.Title,
            Type = vc.Type,
            Link = vc.Link,
            PdfUrl = vc.PdfUrl,
            VestibularId = vc.VestibularId
        });
    }

    // DELETE /api/vestibulares/{id}/contents/{contentId}
    [HttpDelete("{id:int}/contents/{contentId:int}")]
    public async Task<IActionResult> RemoveContent(int id, int contentId)
    {
        var vc = await _db.VestibularContents.FirstOrDefaultAsync(x => x.VestibularId == id && x.Id == contentId);
        if (vc == null) return NotFound();
        _db.VestibularContents.Remove(vc);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
