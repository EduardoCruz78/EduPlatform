// Vestibular.cs
namespace EduPlatform.Core.Entities.Vestibular;

public class Vestibular
{
    public int Id { get; set; }
    public string Name { get; set; } = "";

    // relations
    public ICollection<VestibularSubject> VestibularSubjects { get; set; } = new List<VestibularSubject>();
    public ICollection<VestibularContent> Contents { get; set; } = new List<VestibularContent>();
}
