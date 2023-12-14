using Common.CQRS;
using Common.DTO.Folders;
using MediatR;

namespace Folders.Queries;

public class GetFoldersCountQuery : BaseQueryEntity, IRequest<List<FoldersCount>>
{
    
}