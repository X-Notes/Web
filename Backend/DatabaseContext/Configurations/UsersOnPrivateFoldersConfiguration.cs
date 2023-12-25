using Common.DatabaseModels.Models.Folders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DatabaseContext.Configurations;

public class UsersOnPrivateFoldersConfiguration : IEntityTypeConfiguration<UsersOnPrivateFolders>
{
    public void Configure(EntityTypeBuilder<UsersOnPrivateFolders> builder)
    {
        builder
            .HasKey(bc => new { bc.FolderId, bc.UserId });

        builder
            .HasOne(bc => bc.Folder)
            .WithMany(b => b.UsersOnPrivateFolders)
            .HasForeignKey(bc => bc.FolderId);

        builder
            .HasOne(bc => bc.User)
            .WithMany(b => b.UsersOnPrivateFolders)
            .HasForeignKey(bc => bc.UserId);
    }
}