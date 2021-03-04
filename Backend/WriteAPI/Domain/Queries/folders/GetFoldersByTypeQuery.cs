using Common.Attributes;
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
        [ValidationGuidAttribute]
        public Guid TypeId { set; get; }
        public GetFoldersByTypeQuery(string email, Guid id):base(email)
        {
            this.TypeId = id;
        }
    }
}
