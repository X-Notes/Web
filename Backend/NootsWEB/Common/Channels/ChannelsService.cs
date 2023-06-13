using Common.DTO.History;
using System.Threading.Channels;

namespace Common.Channels;

public class ChannelsService
{
    public static Channel<NoteHistoryChange> HistoryChannel { set; get; } = Channel.CreateUnbounded<NoteHistoryChange>();
}
