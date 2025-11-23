using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduPlatform.Infrastructure.Data;
using EduPlatform.Core.Entities;
using EduPlatform.Core.Entities.Vestibular;

namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VestibularesController : ControllerBase
{
    private readonly AppDbContext _db;
    public VestibularesController(AppDbContext db) => _db = db;

    // GET /api/vestibulares
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Vestibulares
            .AsNoTracking()
            .Select(v => new VestibularDto { Id = v.Id, Name = v.Name })
            .ToListAsync();
        return Ok(list);
    }

    // POST /api/vestibulares
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] VestibularCreateDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Nome é obrigatório.");

        var v = new Vestibular { Name = dto.Name.Trim() };
        _db.Vestibulares.Add(v);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = v.Id },
            new VestibularDto { Id = v.Id, Name = v.Name });
    }

    // GET /api/vestibulares/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var v = await _db.Vestibulares.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);
        if (v == null) return NotFound();
        return Ok(new VestibularDto { Id = v.Id, Name = v.Name });
    }

    // PUT /api/vestibulares/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] VestibularCreateDto dto)
    {
        var v = await _db.Vestibulares.FindAsync(id);
        if (v == null) return NotFound();
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name)) return BadRequest();

        v.Name = dto.Name.Trim();
        _db.Vestibulares.Update(v);
        await _db.SaveChangesAsync();

        return Ok(new VestibularDto { Id = v.Id, Name = v.Name });
    }

    // DELETE /api/vestibulares/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var v = await _db.Vestibulares.FindAsync(id);
        if (v == null) return NotFound();

        var subjects = _db.VestibularSubjects.Where(x => x.VestibularId == id);
        var contents = _db.VestibularContents.Where(x => x.VestibularId == id);

        _db.RemoveRange(subjects);
        _db.RemoveRange(contents);
        _db.Vestibulares.Remove(v);

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // === Subjects ===
    [HttpPost("{id:int}/subjects")]
    public async Task<IActionResult> CreateAndLinkSubject(
        int id, [FromBody] VestibularSubjectCreateDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Nome da matéria é obrigatório.");

        var vestibular = await _db.Vestibulares.FindAsync(id);
        if (vestibular == null) return NotFound("Vestibular não encontrado.");

        var subj = new Subject { Name = dto.Name.Trim(), SeriesId = null };
        _db.Subjects.Add(subj);
        await _db.SaveChangesAsync();

        var vs = new VestibularSubject { VestibularId = id, SubjectId = subj.Id };
        _db.VestibularSubjects.Add(vs);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVestibularSubjects), new { id },
            new { id = subj.Id, name = subj.Name });
    }

    [HttpDelete("{id:int}/subjects/{subjectId:int}")]
    public async Task<IActionResult> RemoveSubject(int id, int subjectId)
    {
        var join = await _db.VestibularSubjects
            .FirstOrDefaultAsync(x => x.VestibularId == id && x.SubjectId == subjectId);
        if (join == null) return NotFound();
        _db.VestibularSubjects.Remove(join);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id:int}/subjects")]
    public async Task<IActionResult> GetVestibularSubjects(int id)
    {
        var list = await _db.VestibularSubjects
            .AsNoTracking()
            .Where(x => x.VestibularId == id)
            .Include(x => x.Subject)
            .Select(x => new { id = x.SubjectId, name = x.Subject.Name })
            .ToListAsync();
        return Ok(list);
    }

    // === Contents ===
    [HttpGet("{id:int}/contents")]
    public async Task<IActionResult> GetVestibularContents(int id)
    {
        var list = await _db.VestibularContents
            .AsNoTracking()
            .Where(c => c.VestibularId == id)
            .Select(c => new {
                c.Id, c.Title, c.Type, c.Link, c.PdfUrl,
                c.IsShared, OriginalContentId = c.OriginalContentId
            }).ToListAsync();
        return Ok(list);
    }

    [HttpPost("{id:int}/shared-contents")]
    public async Task<IActionResult> AddSharedContent(int id, [FromBody] SharedContentCreateDto dto)
    {
        if (dto == null || dto.ContentId <= 0)
            return BadRequest("contentId inválido.");

        var v = await _db.Vestibulares.FindAsync(id);
        var content = await _db.Contents.FindAsync(dto.ContentId);
        if (v == null || content == null) return NotFound();

        if (await _db.VestibularContents
            .AnyAsync(x => x.VestibularId == id && x.OriginalContentId == dto.ContentId))
            return Conflict("Conteúdo já compartilhado.");

        var vc = new VestibularContent
        {
            VestibularId = id,
            Title = content.Title,
            Type = content.Type,
            Link = content.Link,
            PdfUrl = content.PdfUrl,
            IsShared = true,
            OriginalContentId = dto.ContentId
        };

        _db.VestibularContents.Add(vc);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVestibularContents), new { id }, new { vc.Id });
    }

    [HttpPost("{id:int}/contents")]
    public async Task<IActionResult> CreateVestibularContent(
        int id, [FromBody] VestibularContentCreateDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Título é obrigatório.");
        var v = await _db.Vestibulares.FindAsync(id);
        if (v == null) return NotFound();

        var content = new VestibularContent
        {
            VestibularId = id,
            Title = dto.Title.Trim(),
            Type = dto.Type ?? "Exercise",
            Link = dto.Link,
            PdfUrl = dto.PdfUrl,
            IsShared = false
        };
        _db.VestibularContents.Add(content);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetVestibularContents), new { id }, new { content.Id });
    }

    [HttpDelete("{id:int}/contents/{contentId:int}")]
    public async Task<IActionResult> DeleteVestibularContent(int id, int contentId)
    {
        var c = await _db.VestibularContents
            .FirstOrDefaultAsync(x => x.Id == contentId && x.VestibularId == id);
        if (c == null) return NotFound();
        _db.VestibularContents.Remove(c);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// === DTOs auxiliares ===
public record VestibularDto { public int Id { get; set; } public string Name { get; set; } = ""; }
public record VestibularCreateDto { public string Name { get; set; } = ""; }
public record VestibularSubjectCreateDto { public string Name { get; set; } = ""; }
public record VestibularContentCreateDto
{
    public string Title { get; set; } = "";
    public string? Type { get; set; }
    public string? Link { get; set; }
    public string? PdfUrl { get; set; }
}
public record SharedContentCreateDto { public int ContentId { get; set; } }
