using Common;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.History.Contents;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using DatabaseContext.Repositories.Histories;
using DatabaseContext.Repositories.Notes;
using History.Commands;
using Mapper.Mapping;
using MediatR;

namespace History.Handlers.Commands;

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
		var noteForCopy = await noteRepository.GetNoteWithContentAsNoTracking(request.Id);
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
			UserHistories = request.UserIds.Select(x => new UserNoteSnapshotManyToMany { UserId = x }).ToList(),
			SnapshotFileContents = noteForCopy.Contents
				.Where(x => x.ContentTypeId == ContentTypeENUM.Collection)
				.SelectMany(x => x.GetInternalFilesIds()).Select(x => new SnapshotFileContent { AppFileId = x }).ToList(),
		};

		snapshot.UpdateLabels(labels);
		snapshot.UpdateContentSnapshot(Convert(noteForCopy.Contents));

		var dbSnapshot = await noteSnapshotRepository.AddAsync(snapshot);
		return Unit.Value;
	}

    private ContentSnapshot Convert(List<BaseNoteContent> contents)
    {
        var result = new ContentSnapshot();

        foreach (var content in contents)
        {
            switch (content.ContentTypeId)
            {
                case ContentTypeENUM.Text:
                    {
                        var tNDTO = new TextNoteSnapshot(content.Contents, content.Metadata, content.PlainContent, content.Order, content.ContentTypeId, content.UpdatedAt);
                        result.TextNoteSnapshots.Add(tNDTO);
                        break;
                    }
                case ContentTypeENUM.Collection:
                    {
                        var fileIds = content.Files.Select(item => item.Id).ToList();
                        var collectionDTO = new CollectionNoteSnapshot(fileIds, content.Metadata,
	                        content.Order, content.ContentTypeId, content.UpdatedAt);
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