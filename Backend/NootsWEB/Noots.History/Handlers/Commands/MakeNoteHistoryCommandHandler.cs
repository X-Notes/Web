using Common;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.History.Contents;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using MediatR;
using Noots.DatabaseContext.Repositories.Histories;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.History.Commands;
using Noots.Mapper.Mapping;

namespace Noots.History.Handlers.Commands;

public class MakeNoteHistoryCommandHandler: IRequestHandler<MakeNoteHistoryCommand, Unit>
{
	private readonly NoteRepository noteRepository;

	private readonly NoteSnapshotRepository noteSnapshotRepository;

	public MakeNoteHistoryCommandHandler(
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

        var noteText = string.Join("", noteForCopy.GetTextContents().Select(x => x.GetContentString()));

        if(string.IsNullOrEmpty(noteForCopy.Title) && string.IsNullOrWhiteSpace(noteText) && !noteForCopy.GetCollectionContents().Any())
        {
            return Unit.Value;
        }

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