using Common.DTO.Folders.Copy;
using Common.DTO.History;
using Common.DTO.Notes.Copy;
using System.Threading.Channels;

namespace Common.Channels;

public class ChannelsService
{
    public static Channel<NoteHistoryChange> HistoryChannel { set; get; } = Channel.CreateUnbounded<NoteHistoryChange>();

    public static Channel<CopyNote> CopyNotesChannel { set; get; } = Channel.CreateUnbounded<CopyNote>();

    public static Channel<CopyFolder> CopyFoldersChannel { set; get; } = Channel.CreateUnbounded<CopyFolder>();
}
