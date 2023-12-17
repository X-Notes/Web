namespace SignalrUpdater.Impl;

public class NoteShareStatusValue
{
    public bool IsShared { set; get; }
    
    public List<Guid> UserIds { set; get; }
}