using System;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.NoteInner.FileContent.Videos
{
    public class UnlinkVideosCollectionCommand : BaseUnlinkCommand
    {
        public UnlinkVideosCollectionCommand(Guid noteId, Guid contentId, string email) : base(noteId, contentId, email)
        {
        }
    }
}
