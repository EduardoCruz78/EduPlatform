namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/accessibility")]
public class AccessibilityController : ControllerBase
{
    private readonly AppDbContext _db;
    public AccessibilityController(AppDbContext db) => _db = db;

    // GET /api/accessibility/categories
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var list = await _db.AccessibilityCategories
            .AsNoTracking()
            .Select(c => new AccessibilityCategoryDto { Id = c.Id, Name = c.Name, Description = c.Description })
            .ToListAsync();

        return Ok(list);
    }

    // POST /api/accessibility/categories
    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] AccessibilityCategoryDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name)) return BadRequest("Name is required.");
        var c = new AccessibilityCategory { Name = dto.Name.Trim(), Description = dto.Description };
        _db.AccessibilityCategories.Add(c);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCategories), new { id = c.Id }, new AccessibilityCategoryDto { Id = c.Id, Name = c.Name, Description = c.Description });
    }

    // DELETE /api/accessibility/categories/{id}
    [HttpDelete("categories/{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var c = await _db.AccessibilityCategories.FindAsync(id);
        if (c == null) return NotFound();
        _db.AccessibilityCategories.Remove(c);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/accessibility/categories/{id}/topics
    [HttpGet("categories/{id:int}/topics")]
    public async Task<IActionResult> GetCategoryTopics(int id)
    {
        var list = await _db.AccessibilityCategoryTopics
            .AsNoTracking()
            .Where(at => at.AccessibilityCategoryId == id)
            .Include(at => at.Topic)
            .Select(at => new { id = at.Topic.Id, name = at.Topic.Name })
            .ToListAsync();
        return Ok(list);
    }

    // POST /api/accessibility/categories/{id}/topics { topicId }
    [HttpPost("categories/{id:int}/topics")]
    public async Task<IActionResult> AddCategoryTopic(int id, [FromBody] dynamic body)
    {
        int topicId = (int)body.topicId;
        var cat = await _db.AccessibilityCategories.FindAsync(id);
        var topic = await _db.Topics.FindAsync(topicId);
        if (cat == null || topic == null) return NotFound();
        if (await _db.AccessibilityCategoryTopics.AnyAsync(x => x.AccessibilityCategoryId == id && x.TopicId == topicId)) return Conflict();
        _db.AccessibilityCategoryTopics.Add(new AccessibilityCategoryTopic { AccessibilityCategoryId = id, TopicId = topicId });
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/accessibility/categories/{id}/topics/{topicId}
    [HttpDelete("categories/{id:int}/topics/{topicId:int}")]
    public async Task<IActionResult> RemoveCategoryTopic(int id, int topicId)
    {
        var join = await _db.AccessibilityCategoryTopics.FirstOrDefaultAsync(x => x.AccessibilityCategoryId == id && x.TopicId == topicId);
        if (join == null) return NotFound();
        _db.AccessibilityCategoryTopics.Remove(join);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
