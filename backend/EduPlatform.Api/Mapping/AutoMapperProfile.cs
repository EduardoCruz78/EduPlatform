// === File: /backend/EduPlatform.Api/Mapping/AutoMapperProfile.cs ===

namespace EduPlatform.Api.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Map Series -> SeriesDto
            CreateMap<Series, SeriesDto>()
                .ForMember(dest => dest.Subjects, opt => opt.MapFrom(src => src.Subjects));

            // Map Subject -> SubjectDto
            CreateMap<Subject, SubjectDto>();

            // Map Topic -> TopicDto, caso necessário
            CreateMap<Topic, TopicDto>();
        }
    }
}
