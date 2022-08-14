using Common;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.History.Contents;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent;
using MediatR;
using Noots.History.Commands;
using Noots.Mapper.Mapping;
using WriteContext.Repositories.Histories;
using WriteContext.Repositories.Notes;

namespace Noots.History.Impl
{
	public class HistoryHandlerCommand : IRequestHandler<MakeNoteHistoryCommand, Unit>
	{
		private readonly NoteRepository noteRepository;

		private readonly NoteSnapshotRepository noteSnapshotRepository;

		public HistoryHandlerCommand(
            NoteRepository noteRepository,
			NoteSnapshotRepository noteSnapshotRepository)
        {
            this.noteRepository = noteRepository;
			this.noteSnapshotRepository = noteSnapshotRepository;
		}

		public async Task<Unit> Handle(MakeNoteHistoryCommand request, CancellationToken cancellationToken)
		{
			var noteForCopy = await noteRepository.GetNoteWithContent(request.Id);
			var labels = noteForCopy.LabelsNotes.GetLabelUnDesc().Select(x => x.Label).Select(q => new SnapshotNoteLabel { Name = q.Name, Color = q.Color }).ToList();

			var snapshot = new NoteSnapshot()
			{
				NoteTypeId = noteForCopy.NoteTypeId,
				RefTypeId = noteForCopy.RefTypeId,
				Title = noteForCopy.Title,
				Color = noteForCopy.Color,
				SnapshotTime = DateTimeProvider.Time,
				NoteId = noteForCopy.Id,
				Labels = labels,
				UserHistories = request.UserIds.Select(x => new UserNoteSnapshotManyToMany { UserId = x }).ToList(),
				SnapshotFileContents = noteForCopy.Contents.SelectMany(x => x.GetInternalFilesIds()).Select(x => new SnapshotFileContent { AppFileId = x }).ToList(),
				Contents = Convert(noteForCopy.Contents)
			};

			var dbSnapshot = await noteSnapshotRepository.AddAsync(snapshot);
			return Unit.Value;
		}

        private ContentSnapshot Convert(List<BaseNoteContent> contents)
        {
            var result = new ContentSnapshot();

            foreach (var content in contents)
            {
                switch (content)
                {
                    case TextNote tN:
                        {
                            var tNDTO = new TextNoteSnapshot(tN.Contents, tN.NoteTextTypeId, tN.HTypeId, tN.Checked, tN.Order, tN.ContentTypeId, tN.UpdatedAt);
                            result.TextNoteSnapshots.Add(tNDTO);
                            break;
                        }
                    case CollectionNote aN:
                        {
                            var fileIds = aN.Files.Select(item => item.Id).ToList();
                            var collectionDTO = new CollectionNoteSnapshot(aN.Name, fileIds, aN.MetaData, aN.FileTypeId, aN.Order, aN.ContentTypeId, aN.UpdatedAt);
                            result.CollectionNoteSnapshots.Add(collectionDTO);
                            break;
                        }
                    default:
                        {
                            throw new Exception("Incorrect type");
                        }
                }
            }

            return result;
        }
    }
}
