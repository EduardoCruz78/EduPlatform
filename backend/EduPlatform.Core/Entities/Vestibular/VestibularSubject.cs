namespace EduPlatform.Core.Entities.Vestibular;

public class VestibularSubject
{
    public int VestibularId { get; set; }
    public Entities.Vestibular.Vestibular Vestibular { get; set; } = null!;

    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
}
