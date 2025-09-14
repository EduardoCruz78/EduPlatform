namespace EduPlatform.Core.Entities;

public class VestibularSubject
{
    public int VestibularId { get; set; }
    public Vestibular Vestibular { get; set; } = null!;

    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
}