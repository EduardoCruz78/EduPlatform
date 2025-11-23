namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ContentsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Contents
            .AsNoTracking()
            .Select(c => new {
                Id = c.Id,
                Title = c.Title,
                Type = c.Type,
                Link = c.Link,
                ThumbnailUrl = c.ThumbnailUrl,
                PdfUrl = c.PdfUrl,
                TopicId = c.TopicId
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var c = await _db.Contents.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (c == null) return NotFound();
        var dto = new {
            Id = c.Id,
            Title = c.Title,
            Type = c.Type,
            Link = c.Link,
            ThumbnailUrl = c.ThumbnailUrl,
            PdfUrl = c.PdfUrl,
            TopicId = c.TopicId
        };
        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ContentCreateDto dto)
    {
        if (dto == null) return BadRequest("Payload is required.");
        if (string.IsNullOrWhiteSpace(dto.Title)) return BadRequest("Title is required.");
        if (dto.TopicId <= 0) return BadRequest("TopicId is required and must be > 0.");

        var type = (dto.Type ?? "Video").Trim();

        // validação condicional: Link é obrigatório apenas para Video
        if (type.Equals("Video", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(dto.Link))
                return BadRequest(new {
                    type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                    title = "One or more validation errors occurred.",
                    status = 400,
                    errors = new { Link = new[] { "The Link field is required for Video type." } }
                });
        }

        var topicExists = await _db.Topics.AnyAsync(t => t.Id == dto.TopicId);
        if (!topicExists) return BadRequest("Topic not found.");

        var content = new Content
        {
            Title = dto.Title!.Trim(),
            Type = type,
            Link = dto.Link,
            ThumbnailUrl = dto.ThumbnailUrl,
            PdfUrl = dto.PdfUrl,
            TopicId = dto.TopicId
        };

        _db.Contents.Add(content);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = content.Id }, new {
            Id = content.Id,
            Title = content.Title,
            Type = content.Type,
            Link = content.Link,
            ThumbnailUrl = content.ThumbnailUrl,
            PdfUrl = content.PdfUrl,
            TopicId = content.TopicId
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ContentCreateDto dto)
    {
        var content = await _db.Contents.FindAsync(id);
        if (content == null) return NotFound();
        if (dto == null) return BadRequest();
        if (string.IsNullOrWhiteSpace(dto.Title)) return BadRequest("Title is required.");
        if (dto.TopicId <= 0) return BadRequest("TopicId is required and must be > 0.");

        var type = (dto.Type ?? content.Type ?? "Video").Trim();
        if (type.Equals("Video", StringComparison.OrdinalIgnoreCase))
        {
            // se nem o payload nem o registro atual tem link, erro
            if (string.IsNullOrWhiteSpace(dto.Link) && string.IsNullOrWhiteSpace(content.Link))
                return BadRequest(new {
                    type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                    title = "One or more validation errors occurred.",
                    status = 400,
                    errors = new { Link = new[] { "The Link field is required for Video type." } }
                });
        }

        var topicExists = await _db.Topics.AnyAsync(t => t.Id == dto.TopicId);
        if (!topicExists) return BadRequest("Topic not found.");

        content.Title = dto.Title!.Trim();
        content.Type = type;
        if (dto.Link != null) content.Link = dto.Link;
        if (dto.ThumbnailUrl != null) content.ThumbnailUrl = dto.ThumbnailUrl;
        if (dto.PdfUrl != null) content.PdfUrl = dto.PdfUrl;
        content.TopicId = dto.TopicId;

        _db.Contents.Update(content);
        await _db.SaveChangesAsync();

        return Ok(new {
            Id = content.Id,
            Title = content.Title,
            Type = content.Type,
            Link = content.Link,
            ThumbnailUrl = content.ThumbnailUrl,
            PdfUrl = content.PdfUrl,
            TopicId = content.TopicId
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var content = await _db.Contents.FindAsync(id);
        if (content == null) return NotFound();

        _db.Contents.Remove(content);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
