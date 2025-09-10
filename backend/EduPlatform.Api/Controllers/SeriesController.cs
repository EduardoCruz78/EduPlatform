// === File: /backend/EduPlatform.Api/Controllers/SeriesController.cs ===
using EduPlatform.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using EduPlatform.Core.DTOs;

namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/series")]
public class SeriesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public SeriesController(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var list = await _db.Series
                .AsNoTracking()
                .Include(s => s.Subjects) // garante que Subjects sejam carregados
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<SeriesDto>>(list);
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return Problem($"Erro ao obter séries: {ex.Message}", statusCode: 500);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        try
        {
            var series = await _db.Series
                .AsNoTracking()
                .Include(s => s.Subjects)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (series == null) return NotFound(new { Message = "Série não encontrada" });

            var dto = _mapper.Map<SeriesDto>(series);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            return Problem($"Erro ao obter série: {ex.Message}", statusCode: 500);
        }
    }

    [HttpGet("{id:int}/subjects")]
    public async Task<IActionResult> GetSubjects(int id)
    {
        try
        {
            var subjects = await _db.Subjects
                .Where(s => s.SeriesId == id)
                .AsNoTracking()
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<SubjectDto>>(subjects);
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return Problem($"Erro ao obter subjects: {ex.Message}", statusCode: 500);
        }
    }
}
