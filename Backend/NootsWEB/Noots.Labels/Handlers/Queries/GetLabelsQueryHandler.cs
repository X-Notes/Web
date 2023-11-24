using Common.DTO.Labels;
using Mapper.Mapping;
using MediatR;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.Labels.Queries;

namespace Noots.Labels.Handlers.Queries;

public class GetLabelsQueryHandler : IRequestHandler<GetLabelsQuery, List<LabelDTO>>
{
    private readonly LabelRepository labelRepository;

    private NoteFolderLabelMapper appCustomMapper;
    
    public GetLabelsQueryHandler(NoteFolderLabelMapper appCustomMapper, LabelRepository labelRepository)
    {
        this.appCustomMapper = appCustomMapper;
        this.labelRepository = labelRepository;
    }
    
    public async Task<List<LabelDTO>> Handle(GetLabelsQuery request, CancellationToken cancellationToken)
    {
        var labels = await labelRepository.GetAllByUserID(request.UserId);
        return appCustomMapper.MapLabelsToLabelsDTO(labels);
    }
}