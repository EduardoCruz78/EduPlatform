namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/accessibility/themes")]
public class AccessibilityThemesController : ControllerBase
{
    private readonly AppDbContext _db;
    public AccessibilityThemesController(AppDbContext db) => _db = db;

    // GET /api/accessibility/themes?categoryId=1
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int? categoryId)
    {
        var q = _db.AccessibilityThemes.AsNoTracking().AsQueryable();
        if (categoryId.HasValue) q = q.Where(t => t.AccessibilityCategoryId == categoryId.Value);
        var list = await q.Select(t => new AccessibilityThemeDto
        {
            Id = t.Id,
            AccessibilityCategoryId = t.AccessibilityCategoryId,
            Title = t.Title,
            Content = t.Content
        }).ToListAsync();
        return Ok(list);
    }

    // POST /api/accessibility/themes
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AccessibilityThemeDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Title)) return BadRequest("Title required.");
        var cat = await _db.AccessibilityCategories.FindAsync(dto.AccessibilityCategoryId);
        if (cat == null) return BadRequest("Invalid category.");
        var t = new AccessibilityTheme { AccessibilityCategoryId = dto.AccessibilityCategoryId, Title = dto.Title.Trim(), Content = dto.Content };
        _db.Add(t);
        await _db.SaveChangesAsync();
        dto.Id = t.Id;
        return CreatedAtAction(nameof(Get), new { id = t.Id }, dto);
    }

    // DELETE /api/accessibility/themes/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var t = await _db.AccessibilityThemes.FindAsync(id);
        if (t == null) return NotFound();
        _db.AccessibilityThemes.Remove(t);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
