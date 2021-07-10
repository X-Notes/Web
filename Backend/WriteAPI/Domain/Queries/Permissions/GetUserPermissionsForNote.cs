using System;
using Common.DTO.Permissions;
using MediatR;

namespace Domain.Queries.Permissions
{
    public class GetUserPermissionsForNote : BaseQueryEntity, IRequest<UserPermissionsForNote>
    { 
        public Guid NoteId { set; get; }

        public GetUserPermissionsForNote(Guid NoteId, string Email)
        {
            this.NoteId = NoteId;
            this.Email = Email;
        }
    }
}
