using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Mapping;
using BI.Services.History;
using BI.SignalR;
using Common;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.ContentParts;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO.Files;
using Common.DTO.Notes;
using Domain.Commands.Files;
using Domain.Commands.Notes;
using Domain.Queries.Files;
using Domain.Queries.Permissions;
using MediatR;
using Storage;
using WriteContext.Repositories;
using WriteContext.Repositories.Labels;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Users;

namespace BI.Services.Notes
{
    public class NoteHandlerCommand :
        IRequestHandler<NewPrivateNoteCommand, SmallNote>,
        IRequestHandler<ChangeColorNoteCommand, Unit>,
        IRequestHandler<SetDeleteNoteCommand, Unit>,
        IRequestHandler<DeleteNotesCommand, Unit>,
        IRequestHandler<ArchiveNoteCommand, Unit>,
        IRequestHandler<MakePrivateNoteCommand, Unit>,
        IRequestHandler<CopyNoteCommand, List<Guid>>,
        IRequestHandler<MakeNoteHistoryCommand, Unit>,
        IRequestHandler<RemoveLabelFromNoteCommand, Unit>,
        IRequestHandler<AddLabelOnNoteCommand, Unit>
    {

        private readonly UserRepository userRepository;
        private readonly NoteRepository noteRepository;
        private readonly AppCustomMapper noteCustomMapper;
        private readonly LabelsNotesRepository labelsNotesRepository;
        private readonly BaseNoteContentRepository baseNoteContentRepository;
        private readonly IMediator _mediator;
        private readonly AppSignalRService appSignalRService;
        private readonly HistoryCacheService historyCacheService;

        public NoteHandlerCommand(
            UserRepository userRepository, NoteRepository noteRepository,
            AppCustomMapper noteCustomMapper, IMediator _mediator, LabelsNotesRepository labelsNotesRepository,
            BaseNoteContentRepository baseNoteContentRepository, AppSignalRService appSignalRService,
            HistoryCacheService historyCacheService)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.noteCustomMapper = noteCustomMapper;
            this._mediator = _mediator;
            this.labelsNotesRepository = labelsNotesRepository;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.appSignalRService = appSignalRService;
            this.historyCacheService = historyCacheService;
        }


        public async Task<SmallNote> Handle(NewPrivateNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);

            var _contents = new List<BaseNoteContent>();

            var newText = new TextNote { Id = Guid.NewGuid(), Order = 1, NoteTextTypeId = NoteTextTypeENUM.Default };
            _contents.Add(newText);

            var note = new Note()
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Order = 1,
                Color = NoteColorPallete.Green,
                NoteTypeId = NoteTypeENUM.Private,
                RefTypeId = RefTypeENUM.Viewer,
                CreatedAt = DateTimeOffset.Now,
                UpdatedAt = DateTimeOffset.Now,
                Contents = _contents
            };

            await noteRepository.Add(note, NoteTypeENUM.Private);

            var newNote = await noteRepository.GetOneById(note.Id);
            newNote.LabelsNotes = new List<LabelsNotes>();

            return noteCustomMapper.MapNoteToSmallNoteDTO(newNote);
        }

        public async Task<Unit> Handle(ChangeColorNoteCommand request, CancellationToken cancellationToken)
        {
            foreach (var id in request.Ids)
            {
                var command = new GetUserPermissionsForNote(id, request.Email);
                var permissions = await _mediator.Send(command);

                if (permissions.CanWrite)
                {
                    var note = permissions.Note;
                    note.Color = request.Color;
                    note.UpdatedAt = DateTimeOffset.Now;
                    await noteRepository.Update(note);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var fullNote = await noteRepository.GetFull(note.Id);
                    var noteForUpdating = noteCustomMapper.MapNoteToFullNote(fullNote);
                    await appSignalRService.UpdateGeneralFullNote(noteForUpdating);
                }
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(SetDeleteNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var note = notes.FirstOrDefault();
            if (notes.Count == request.Ids.Count)
            {
                notes.ForEach(note => note.RefType = null);
                user.Notes.ForEach(x => x.DeletedAt = DateTimeOffset.Now);
                await noteRepository.CastNotes(notes, user.Notes, note.NoteTypeId, NoteTypeENUM.Deleted);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(DeleteNotesCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
            var deletednotes = user.Notes.Where(x => x.NoteTypeId == NoteTypeENUM.Deleted).ToList();
            var selectdeletenotes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();

            if (selectdeletenotes.Count == request.Ids.Count)
            {
                var contents = await baseNoteContentRepository.GetContentByNoteIds(request.Ids);
                var noteFiles = contents.Where(x => x is AlbumNote).Select(x => x as AlbumNote).SelectMany(x => x.Photos).ToList();
                var documents = contents.Where(x => x is DocumentNote).Select(x => x as DocumentNote).Select(x => x.AppFile);
                var audios = contents.Where(x => x is AudiosPlaylistNote).Select(x => x as AudiosPlaylistNote).SelectMany(x => x.Audios);
                var videos = contents.Where(x => x is VideoNote).Select(x => x as VideoNote).Select(x => x.AppFile);
                noteFiles.AddRange(documents);
                noteFiles.AddRange(audios);
                noteFiles.AddRange(videos);

                await baseNoteContentRepository.RemoveRange(contents);
                await noteRepository.DeleteRangeDeleted(selectdeletenotes, deletednotes);

                noteFiles = noteFiles.DistinctBy(x => x.Id).ToList();
                await _mediator.Send(new RemoveFilesCommand(user.Id.ToString(), noteFiles));
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(ArchiveNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var note = notes.FirstOrDefault();
            if (notes.Count == request.Ids.Count)
            {
                notes.ForEach(note => note.RefType = null);
                await noteRepository.CastNotes(notes, user.Notes, note.NoteTypeId, NoteTypeENUM.Archived);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(MakePrivateNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var note = notes.FirstOrDefault();
            if (notes.Count == request.Ids.Count)
            {
                notes.ForEach(note => note.RefType = null);
                await noteRepository.CastNotes(notes, user.Notes, note.NoteTypeId, NoteTypeENUM.Private);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<List<Guid>> Handle(CopyNoteCommand request, CancellationToken cancellationToken)
        {
            var resultIds = new List<Guid>();
            var order = -1;
            // TODO DO ONE QUERY
            foreach (var id in request.Ids)
            {
                var command = new GetUserPermissionsForNote(id, request.Email);
                var permissions = await _mediator.Send(command);

                if (permissions.CanRead)
                {
                    var noteForCopy = await noteRepository.GetNoteByIdForCopy(id);
                    var newNote = new Note()
                    {
                        Title = noteForCopy.Title,
                        Color = noteForCopy.Color,
                        CreatedAt = DateTimeOffset.Now,
                        UpdatedAt = DateTimeOffset.Now,
                        NoteTypeId = NoteTypeENUM.Private,
                        RefTypeId = noteForCopy.RefTypeId,
                        Order = order--,
                        UserId = permissions.User.Id,
                    };
                    var dbNote = await noteRepository.Add(newNote);
                    resultIds.Add(dbNote.Entity.Id);
                    var labels = noteForCopy.LabelsNotes.Select(label => new LabelsNotes()
                    {
                        NoteId = dbNote.Entity.Id,
                        LabelId = label.LabelId,
                        AddedAt = DateTimeOffset.Now
                    });

                    await labelsNotesRepository.AddRange(labels);

                    var contents = new List<BaseNoteContent>();

                    foreach (var contentForCopy in noteForCopy.Contents)
                    {
                        switch (contentForCopy)
                        {
                            case TextNote textNote:
                                {
                                    contents.Add(new TextNote(textNote, dbNote.Entity.Id));
                                    continue;
                                }
                            case AlbumNote album:
                                {

                                    if(permissions.IsOwner)
                                    {
                                        var dbFiles = album.AlbumNoteAppFiles.Select(x => new AlbumNoteAppFile
                                        {
                                            AlbumNoteId = dbNote.Entity.Id,
                                            AppFileId = x.AppFileId
                                        }).ToList();
                                        contents.Add(new AlbumNote(album, dbFiles, dbNote.Entity.Id));
                                    }
                                    else
                                    {
                                        var copyCommands = album.Photos.Select(file => new CopyBlobFromContainerToContainerCommand(permissions.Author.Id, permissions.User.Id, file, ContentTypesFile.Images));
                                        var tasks = copyCommands.Select(x => _mediator.Send(x)).ToList();
                                        var copyPhotos = (await Task.WhenAll(tasks)).ToList();
                                        contents.Add(new AlbumNote(album, copyPhotos, dbNote.Entity.Id));
                                    }
                                    continue;
                                }
                            case VideoNote videoNote:
                                {
                                    if (permissions.IsOwner)
                                    {
                                        contents.Add(new VideoNote(videoNote, videoNote.AppFileId, dbNote.Entity.Id));
                                    }
                                    else
                                    {
                                        var copyCommand = new CopyBlobFromContainerToContainerCommand(permissions.Author.Id, permissions.User.Id, videoNote.AppFile, ContentTypesFile.Videos);
                                        var fileCopy = await _mediator.Send(copyCommand);
                                        contents.Add(new VideoNote(videoNote, fileCopy, dbNote.Entity.Id));
                                    }
                                    continue;
                                }
                            case AudiosPlaylistNote audioNote:
                                {
                                    if(permissions.IsOwner)
                                    {
                                        var dbFiles = audioNote.AudioNoteAppFiles.Select(x => new AudioNoteAppFile
                                        {
                                            AudioNoteId = dbNote.Entity.Id,
                                            AppFileId = x.AppFileId
                                        }).ToList();

                                        contents.Add(new AudiosPlaylistNote(audioNote, dbFiles, dbNote.Entity.Id));
                                    }
                                    else
                                    {
                                        var copyCommands = audioNote.Audios.Select(file => new CopyBlobFromContainerToContainerCommand(permissions.Author.Id, permissions.User.Id, file, ContentTypesFile.Audios));
                                        var tasks = copyCommands.Select(x => _mediator.Send(x)).ToList();
                                        var copyAudios = (await Task.WhenAll(tasks)).ToList();
                                        contents.Add(new AudiosPlaylistNote(audioNote, copyAudios, dbNote.Entity.Id));
                                    }
                                    continue;
                                }
                            case DocumentNote documentNote:
                                {
                                    if (permissions.IsOwner)
                                    {
                                        contents.Add(new DocumentNote(documentNote, documentNote.AppFileId, dbNote.Entity.Id));
                                    }
                                    else
                                    {
                                        var copyCommand = new CopyBlobFromContainerToContainerCommand(permissions.Author.Id, permissions.User.Id, documentNote.AppFile, ContentTypesFile.Files);
                                        var fileCopy = await _mediator.Send(copyCommand);
                                        contents.Add(new DocumentNote(documentNote, fileCopy, dbNote.Entity.Id));
                                    }
                                    continue;
                                }
                            default:
                                {
                                    throw new Exception("Incorrect type");
                                }
                        }
                    }
                    await baseNoteContentRepository.AddRange(contents);
                }
            }

            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);

            var dbNotes = await noteRepository.GetWhere(x => 
                x.UserId == user.Id 
                && x.NoteTypeId == NoteTypeENUM.Private);

            var orders = Enumerable.Range(1, dbNotes.Count);

            dbNotes = dbNotes.Zip(orders, (note, order) =>
            {
                note.Order = order;
                return note;
            }).ToList();

            return resultIds;
        }

        public async Task<Unit> Handle(RemoveLabelFromNoteCommand request, CancellationToken cancellationToken)
        {
            foreach (var id in request.NoteIds)
            {
                var command = new GetUserPermissionsForNote(id, request.Email);
                var permissions = await _mediator.Send(command);

                if (permissions.CanWrite)
                {
                    var note = permissions.Note;

                    var value = await labelsNotesRepository.FirstOrDefaultAsync(x => x.LabelId == request.LabelId && x.NoteId == note.Id);

                    if (value != null)
                    {
                        await labelsNotesRepository.Remove(value);

                        // TODO  MAKE UPDATE NOTE DATE

                        historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                        var fullNote = await noteRepository.GetFull(note.Id);
                        var noteForUpdating = noteCustomMapper.MapNoteToFullNote(fullNote);
                        await appSignalRService.UpdateGeneralFullNote(noteForUpdating);
                    }
                }
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(AddLabelOnNoteCommand request, CancellationToken cancellationToken)
        {
            foreach (var id in request.NoteIds)
            {
                var command = new GetUserPermissionsForNote(id, request.Email);
                var permissions = await _mediator.Send(command);

                if (permissions.CanWrite)
                {
                    var note = permissions.Note;

                    var value = await labelsNotesRepository.FirstOrDefaultAsync(x => x.LabelId == request.LabelId && x.NoteId == note.Id);

                    if (value == null)
                    {
                        var noteLabel = new LabelsNotes() { LabelId = request.LabelId, NoteId = note.Id, AddedAt = DateTimeOffset.Now };

                        await labelsNotesRepository.Add(noteLabel);

                        // TODO  MAKE UPDATE NOTE DATE

                        historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                        var fullNote = await noteRepository.GetFull(note.Id);
                        var noteForUpdating = noteCustomMapper.MapNoteToFullNote(fullNote);
                        await appSignalRService.UpdateGeneralFullNote(noteForUpdating);
                    }
                }
            }
            return Unit.Value;
        }

        public Task<Unit> Handle(MakeNoteHistoryCommand request, CancellationToken cancellationToken)
        {
            // TODO
            throw new NotImplementedException();
        }
    }
}