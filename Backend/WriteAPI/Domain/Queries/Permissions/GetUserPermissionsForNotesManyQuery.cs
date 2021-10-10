using Common.DTO.Permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Queries.Permissions
{
    public class GetUserPermissionsForNotesManyQuery : BaseQueryEntity, IRequest<List<(Guid, UserPermissionsForNote)>>
    {
        public List<Guid> NoteIds { set; get; }

        public GetUserPermissionsForNotesManyQuery(List<Guid> noteIds, string email)
        {
            this.NoteIds = noteIds;
            this.Email = email;
        }
    }
}
