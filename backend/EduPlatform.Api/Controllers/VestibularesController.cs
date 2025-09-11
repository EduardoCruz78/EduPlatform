// === File: /backend/EduPlatform.Api/Controllers/VestibularesController.cs ===

namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/vestibulares")]
public class VestibularesController : ControllerBase
{
    private readonly AppDbContext _db;
    public VestibularesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _db.Vestibulares.AsNoTracking().ToListAsync());

    [HttpGet("{id:int}/subjects")]
    public async Task<IActionResult> GetSubjects(int id)
    {
        var vestibular = await _db.Vestibulares.AsNoTracking().Include(v => v.Subjects).FirstOrDefaultAsync(v => v.Id == id);
        if (vestibular == null) return NotFound();
        return Ok(vestibular.Subjects);
    }
}