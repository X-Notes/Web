using DatabaseContext.Repositories.Labels;
using Labels.Queries;
using MediatR;

namespace Labels.Handlers.Queries;

public class GetCountNotesByLabelQueryHandler : IRequestHandler<GetCountNotesByLabelQuery, int>
{
    private readonly LabelRepository labelRepository;
    
    public GetCountNotesByLabelQueryHandler(LabelRepository labelRepository)
    {
        this.labelRepository = labelRepository;
    }
    
    public async Task<int> Handle(GetCountNotesByLabelQuery request, CancellationToken cancellationToken)
    {
        return await this.labelRepository.GetNotesCountByLabelId(request.LabelId);
    }
}