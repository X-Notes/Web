using Common.DTO.search;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Queries.search
{
    public class GetNotesAndFolderForSearch : BaseQueryEntity, IRequest<SearchNoteFolderResult>
    {
        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string SearchString { set; get; }
    }
}
