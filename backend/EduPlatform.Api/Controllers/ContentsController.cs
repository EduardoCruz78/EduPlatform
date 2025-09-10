// === File: /backend/EduPlatform.Api/Controllers/ContentsController.cs ===
using EduPlatform.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/contents")]
public class ContentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ContentsController(AppDbContext db) => _db = db;

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var content = await _db.Contents.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (content == null) return NotFound();
        return Ok(content);
    }
}