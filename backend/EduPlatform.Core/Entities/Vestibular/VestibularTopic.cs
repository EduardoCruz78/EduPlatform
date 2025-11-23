namespace EduPlatform.Core.Entities.Vestibular;

public class VestibularTopic
{
    public int Id { get; set; }
    public int VestibularId { get; set; }
    public Entities.Vestibular.Vestibular Vestibular { get; set; } = null!;

    // título do tópico no vestibular (ex: "Equação do 2º grau (ENEM)")
    public string Name { get; set; } = "";

    // se esse tópico é um "shared" a partir de outro tópico do sistema (Topic.Id)
    public int? OriginalTopicId { get; set; }

    // flag para indicar se é tópico importado (shared) ou criado especificamente pro vestibular
    public bool IsShared { get; set; } = false;

    // campos extras: descrição / tags / tipo de foco (ex.: exercícios, teoria)
    public string? Notes { get; set; }
    public string? Tags { get; set; }
}
