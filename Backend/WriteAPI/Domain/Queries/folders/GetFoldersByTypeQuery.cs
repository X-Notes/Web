using Common.Attributes;
using Common.DatabaseModels.models.Folders;
using Common.DTO.folders;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Queries.folders
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
