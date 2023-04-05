namespace Noots.SignalrUpdater.Impl;

public static class WsNameHelper
{
    public static string GetNoteGroupName(Guid id) => "N-" + id.ToString();

    public static string GetFolderGroupName(Guid id) => "F-" + id.ToString();
}
