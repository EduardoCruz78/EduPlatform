namespace EduPlatform.Core.Entities.Vestibular;

public class VestibularContent
{
    public int Id { get; set; }
    public int VestibularId { get; set; }
    public Entities.Vestibular.Vestibular Vestibular { get; set; } = null!;

    public string Title { get; set; } = "";
    public string? Type { get; set; }  // Video | Exercise | Simulated
    public string? Link { get; set; }
    public string? PdfUrl { get; set; }

    // If this is a shared content referencing an existing Content in the system
    public bool IsShared { get; set; } = false;
    public int? OriginalContentId { get; set; }
    public Content? OriginalContent { get; set; }
}