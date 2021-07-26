using System;
using Common.DTO.Permissions;
using MediatR;

namespace Domain.Queries.Permissions
{
    public class GetUserPermissionsForNoteQuery : BaseQueryEntity, IRequest<UserPermissionsForNote>
    { 
        public Guid NoteId { set; get; }

        public GetUserPermissionsForNoteQuery(Guid NoteId, string Email)
        {
            this.NoteId = NoteId;
            this.Email = Email;
        }
    }
}
