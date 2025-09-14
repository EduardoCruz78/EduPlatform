namespace EduPlatform.Core.DTOs;

public class VestibularDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Date { get; set; }
    public string? Description { get; set; }
    public string? Url { get; set; }
}