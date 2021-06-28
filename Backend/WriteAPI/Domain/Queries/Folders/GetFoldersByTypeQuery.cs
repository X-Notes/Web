using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.DatabaseModels.Models.Folders;
using Common.DTO.Folders;
using MediatR;

namespace Domain.Queries.Folders
{
    public class GetFoldersByTypeQuery : BaseQueryEntity, IRequest<List<SmallFolder>>
    {
        [Required]
        public FolderTypeENUM TypeId { set; get; }
        public GetFoldersByTypeQuery(string email, FolderTypeENUM id):base(email)
        {
            this.TypeId = id;
        }
    }
}
