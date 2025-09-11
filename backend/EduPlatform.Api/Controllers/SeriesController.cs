// === File: /backend/EduPlatform.Api/Controllers/SeriesController.cs ===
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduPlatform.Infrastructure.Data;
using EduPlatform.Core.DTOs;

namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeriesController : ControllerBase
{
    private readonly AppDbContext _db;
    public SeriesController(AppDbContext db) => _db = db;

    // GET /api/series  -> retorna apenas id + name para evitar erros de navegação
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var list = await _db.Series
                .AsNoTracking()
                .Select(s => new SeriesDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    // não preenchemos Subjects aqui para evitar dependência de navegação
                    Subjects = new System.Collections.Generic.List<SubjectDto>()
                })
                .ToListAsync();

            return Ok(list);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[SeriesController.GetAll] Erro: {ex}");
            return Problem($"Erro ao obter séries: {ex.Message}", statusCode: 500);
        }
    }

    // GET /api/series/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var s = await _db.Series
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new SeriesDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Subjects = new System.Collections.Generic.List<SubjectDto>()
                })
                .FirstOrDefaultAsync();

            if (s == null) return NotFound();
            return Ok(s);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[SeriesController.GetById] Erro: {ex}");
            return Problem($"Erro ao obter série: {ex.Message}", statusCode: 500);
        }
    }

    // GET /api/series/{id}/subjects  -> robusto: pega subjects via SeriesId
    [HttpGet("{id:int}/subjects")]
    public async Task<IActionResult> GetSubjects(int id)
    {
        try
        {
            var subjects = await _db.Subjects
                .AsNoTracking()
                .Where(s => s.SeriesId == id)
                .Select(s => new SubjectDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    SeriesId = s.SeriesId
                })
                .ToListAsync();

            return Ok(subjects);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[SeriesController.GetSubjects] Erro: {ex}");
            return Problem($"Erro ao obter matérias da série: {ex.Message}", statusCode: 500);
        }
    }
}
