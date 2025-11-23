// === File: /backend/EduPlatform.Api/Controllers/ChecklistController.cs ===

namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/checklist")]
public class ChecklistController : ControllerBase
{
    private readonly AppDbContext _db;
    public ChecklistController(AppDbContext db) => _db = db;

    // GET /api/checklist
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetMyChecklist()
    {
        var providerId = GetProviderIdFromClaims();
        if (providerId == null) return Unauthorized();

        var user = await EnsureUserExists(providerId);

        var items = await _db.Checklists
            .Where(c => c.UserId == user.Id)
            .Include(c => c.Content)
            .AsNoTracking()
            .ToListAsync();

        return Ok(items);
    }

    // POST /api/checklist  { "contentId": 1 }
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> MarkCompleted([FromBody] MarkChecklistRequest req)
    {
        if (req == null || req.ContentId <= 0) return BadRequest();
        var providerId = GetProviderIdFromClaims();
        if (providerId == null) return Unauthorized();

        var user = await EnsureUserExists(providerId);

        var exists = await _db.Checklists.AnyAsync(c => c.UserId == user.Id && c.ContentId == req.ContentId);
        if (exists) return Conflict("Already marked");

        var content = await _db.Contents.FindAsync(req.ContentId);
        if (content == null) return NotFound("Content not found");

        var item = new Checklist
        {
            UserId = user.Id,
            ContentId = req.ContentId
        };

        _db.Checklists.Add(item);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMyChecklist), null);
    }

    // DELETE /api/checklist/{contentId}
    [Authorize]
    [HttpDelete("{contentId:int}")]
    public async Task<IActionResult> RemoveMark(int contentId)
    {
        var providerId = GetProviderIdFromClaims();
        if (providerId == null) return Unauthorized();

        var user = await EnsureUserExists(providerId);

        var item = await _db.Checklists.FirstOrDefaultAsync(c => c.UserId == user.Id && c.ContentId == contentId);
        if (item == null) return NotFound();

        _db.Checklists.Remove(item);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private string? GetProviderIdFromClaims()
    {
        // Google will populate ClaimTypes.NameIdentifier or the 'sub' claim
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(sub)) return sub;
        sub = User.FindFirst("sub")?.Value;
        return sub;
    }

    private async Task<User> EnsureUserExists(string providerId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.ProviderId == providerId);
        if (user != null) return user;

        // Create user from claims
        var name = User.FindFirst(ClaimTypes.Name)?.Value ?? User.Identity?.Name ?? "Unknown";
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;

        user = new User
        {
            ProviderId = providerId,
            Name = name,
            Email = email
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public class MarkChecklistRequest
    {
        public int ContentId { get; set; }
    }
}