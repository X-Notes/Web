using Common.DatabaseModels.Models.NoteContent;

namespace Common.Interfaces.Note
{
    public interface IBaseNoteContent: IDateUpdater
    {
        int Order { set; get; }
        ContentTypeENUM ContentTypeId { set; get; }
    }
}
