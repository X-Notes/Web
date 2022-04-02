using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Mapping;
using Common.DTO.Labels;
using Domain.Queries.Labels;
using MediatR;
using WriteContext.Repositories.Labels;

namespace BI.Services.Labels
{
    public class LabelHandlerQuery :
        IRequestHandler<GetLabelsQuery, List<LabelDTO>>,
        IRequestHandler<GetCountNotesByLabelQuery, int>
    {
        private readonly LabelRepository labelRepository;
        private NoteFolderLabelMapper appCustomMapper;
        public LabelHandlerQuery(LabelRepository labelRepository, NoteFolderLabelMapper appCustomMapper)
        {
            this.labelRepository = labelRepository;
            this.appCustomMapper = appCustomMapper;
        }

        public async Task<List<LabelDTO>> Handle(GetLabelsQuery request, CancellationToken cancellationToken)
        {
            var labels = await labelRepository.GetAllByUserID(request.UserId);
            return appCustomMapper.MapLabelsToLabelsDTO(labels);
        }

        public async Task<int> Handle(GetCountNotesByLabelQuery request, CancellationToken cancellationToken)
        {
            return await this.labelRepository.GetNotesCountByLabelId(request.UserId);
        }
    }
}
