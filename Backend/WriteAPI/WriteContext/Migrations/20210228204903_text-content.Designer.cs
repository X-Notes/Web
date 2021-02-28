﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using WriteContext;

namespace WriteContext.Migrations
{
    [DbContext(typeof(WriteContextDB))]
    [Migration("20210228204903_text-content")]
    partial class textcontent
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .UseIdentityByDefaultColumns()
                .HasAnnotation("Relational:MaxIdentifierLength", 63)
                .HasAnnotation("ProductVersion", "5.0.2");

            modelBuilder.Entity("AlbumNoteAppFile", b =>
                {
                    b.Property<Guid>("AlbumNotesId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("PhotosId")
                        .HasColumnType("uuid");

                    b.HasKey("AlbumNotesId", "PhotosId");

                    b.HasIndex("PhotosId");

                    b.ToTable("AlbumNoteAppFile");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.AppFile", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Path")
                        .HasColumnType("text");

                    b.Property<string>("Type")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Files");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Backgrounds", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<Guid>("FileId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("FileId");

                    b.HasIndex("UserId");

                    b.ToTable("Backgrounds");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Folder", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Color")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<DateTimeOffset>("DeletedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<Guid>("FolderTypeId")
                        .HasColumnType("uuid");

                    b.Property<int>("Order")
                        .HasColumnType("integer");

                    b.Property<Guid>("RefTypeId")
                        .HasColumnType("uuid");

                    b.Property<string>("Title")
                        .HasColumnType("text");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("FolderTypeId");

                    b.HasIndex("RefTypeId");

                    b.HasIndex("UserId");

                    b.ToTable("Folders");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.FolderType", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("FoldersTypes");

                    b.HasData(
                        new
                        {
                            Id = new Guid("f636a31d-857b-4fcd-b9da-2c39c4b1f8e3"),
                            Name = "Private"
                        },
                        new
                        {
                            Id = new Guid("af1f3a32-5660-4a34-b7e8-7cf628a68882"),
                            Name = "Shared"
                        },
                        new
                        {
                            Id = new Guid("9116d2f9-c8bb-4afe-9cac-8320a308c297"),
                            Name = "Deleted"
                        },
                        new
                        {
                            Id = new Guid("5b4fe8b3-4a1f-4175-95c3-5e072195b8c4"),
                            Name = "Archive"
                        });
                });

            modelBuilder.Entity("Common.DatabaseModels.models.FoldersNotes", b =>
                {
                    b.Property<Guid>("NoteId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("FolderId")
                        .HasColumnType("uuid");

                    b.HasKey("NoteId", "FolderId");

                    b.HasIndex("FolderId");

                    b.ToTable("FoldersNotes");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.FontSize", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("FontSizes");

                    b.HasData(
                        new
                        {
                            Id = new Guid("54d8fd39-6414-46e6-952e-03de741c2883"),
                            Name = "Medium"
                        },
                        new
                        {
                            Id = new Guid("715bb5fb-16bd-4a7b-8863-2ea065155616"),
                            Name = "Big"
                        });
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Label", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Color")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<DateTimeOffset>("DeletedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("boolean");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<int>("Order")
                        .HasColumnType("integer");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("Labels");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.LabelsNotes", b =>
                {
                    b.Property<Guid>("NoteId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("LabelId")
                        .HasColumnType("uuid");

                    b.Property<DateTimeOffset>("AddedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("NoteId", "LabelId");

                    b.HasIndex("LabelId");

                    b.ToTable("LabelsNotes");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Language", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Languages");

                    b.HasData(
                        new
                        {
                            Id = new Guid("2d2888f9-4b0e-42df-9516-766d4354dbfd"),
                            Name = "Ukraine"
                        },
                        new
                        {
                            Id = new Guid("315546f7-3953-42c0-90a8-84c76ee99e8a"),
                            Name = "Russian"
                        },
                        new
                        {
                            Id = new Guid("c66a9316-4925-4259-83a7-1835791a84dd"),
                            Name = "English"
                        });
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Note", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Color")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<DateTimeOffset>("DeletedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<Guid>("NoteTypeId")
                        .HasColumnType("uuid");

                    b.Property<int>("Order")
                        .HasColumnType("integer");

                    b.Property<Guid>("RefTypeId")
                        .HasColumnType("uuid");

                    b.Property<string>("Title")
                        .HasColumnType("text");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("NoteTypeId");

                    b.HasIndex("RefTypeId");

                    b.HasIndex("UserId");

                    b.ToTable("Notes");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.NoteContent.BaseNoteContent", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<Guid>("NoteId")
                        .HasColumnType("uuid");

                    b.Property<int>("Order")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("NoteId");

                    b.ToTable("BaseNoteContents");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.NoteType", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("NotesTypes");

                    b.HasData(
                        new
                        {
                            Id = new Guid("74a7752d-a6fa-43da-912d-f437b01b8e83"),
                            Name = "Private"
                        },
                        new
                        {
                            Id = new Guid("ee7badf8-b495-4c24-a6cd-cd7d34ee8451"),
                            Name = "Shared"
                        },
                        new
                        {
                            Id = new Guid("7f652c28-3d2c-452b-a8a2-a7cf1d0807a1"),
                            Name = "Deleted"
                        },
                        new
                        {
                            Id = new Guid("3e0de576-3692-49d2-af93-586e4c4148e2"),
                            Name = "Archive"
                        });
                });

            modelBuilder.Entity("Common.DatabaseModels.models.NotificationSetting", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("UserId")
                        .IsUnique();

                    b.ToTable("NotificationSettings");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.RefType", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("RefTypes");

                    b.HasData(
                        new
                        {
                            Id = new Guid("7a6b901d-950a-4f51-b966-8f3368f86d18"),
                            Name = "Viewer"
                        },
                        new
                        {
                            Id = new Guid("1f38e085-0884-410a-94b7-4c1d484f6ef3"),
                            Name = "Editor"
                        });
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Theme", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Themes");

                    b.HasData(
                        new
                        {
                            Id = new Guid("099d8668-1b68-44fb-9932-a6d0bd4f16c5"),
                            Name = "Light"
                        },
                        new
                        {
                            Id = new Guid("3592f840-6f2b-4d76-9d6a-5a5788a08d37"),
                            Name = "Dark"
                        });
                });

            modelBuilder.Entity("Common.DatabaseModels.models.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<Guid?>("CurrentBackgroundId")
                        .HasColumnType("uuid");

                    b.Property<string>("Email")
                        .HasColumnType("text");

                    b.Property<Guid>("FontSizeId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("LanguageId")
                        .HasColumnType("uuid");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<string>("PersonalKey")
                        .HasColumnType("text");

                    b.Property<Guid?>("PhotoId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("ThemeId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("CurrentBackgroundId")
                        .IsUnique();

                    b.HasIndex("Email")
                        .IsUnique();

                    b.HasIndex("FontSizeId");

                    b.HasIndex("LanguageId");

                    b.HasIndex("PhotoId")
                        .IsUnique();

                    b.HasIndex("ThemeId");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.UserOnNoteNow", b =>
                {
                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("NoteId")
                        .HasColumnType("uuid");

                    b.HasKey("UserId", "NoteId");

                    b.HasIndex("NoteId");

                    b.ToTable("UserOnNoteNow");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.UserOnPrivateNotes", b =>
                {
                    b.Property<Guid>("NoteId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("AccessTypeId")
                        .HasColumnType("uuid");

                    b.HasKey("NoteId", "UserId");

                    b.HasIndex("AccessTypeId");

                    b.HasIndex("UserId");

                    b.ToTable("UserOnPrivateNotes");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.UsersOnPrivateFolders", b =>
                {
                    b.Property<Guid>("FolderId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("AccessTypeId")
                        .HasColumnType("uuid");

                    b.HasKey("FolderId", "UserId");

                    b.HasIndex("AccessTypeId");

                    b.HasIndex("UserId");

                    b.ToTable("UsersOnPrivateFolders");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.NoteContent.AlbumNote", b =>
                {
                    b.HasBaseType("Common.DatabaseModels.models.NoteContent.BaseNoteContent");

                    b.ToTable("AlbumNote");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.NoteContent.TextNote", b =>
                {
                    b.HasBaseType("Common.DatabaseModels.models.NoteContent.BaseNoteContent");

                    b.Property<bool>("Checked")
                        .HasColumnType("boolean");

                    b.Property<string>("Content")
                        .HasColumnType("text");

                    b.Property<string>("HeadingType")
                        .HasColumnType("text");

                    b.Property<string>("TextType")
                        .HasColumnType("text");

                    b.ToTable("TextNote");
                });

            modelBuilder.Entity("AlbumNoteAppFile", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.NoteContent.AlbumNote", null)
                        .WithMany()
                        .HasForeignKey("AlbumNotesId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.AppFile", null)
                        .WithMany()
                        .HasForeignKey("PhotosId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Backgrounds", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.AppFile", "File")
                        .WithMany()
                        .HasForeignKey("FileId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.User", "User")
                        .WithMany("Backgrounds")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("File");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Folder", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.FolderType", "FolderType")
                        .WithMany("Folders")
                        .HasForeignKey("FolderTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.RefType", "RefType")
                        .WithMany("Folders")
                        .HasForeignKey("RefTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.User", "User")
                        .WithMany("Folders")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("FolderType");

                    b.Navigation("RefType");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.FoldersNotes", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.Folder", "Folder")
                        .WithMany("FoldersNotes")
                        .HasForeignKey("FolderId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.Note", "Note")
                        .WithMany("FoldersNotes")
                        .HasForeignKey("NoteId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Folder");

                    b.Navigation("Note");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Label", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.User", "User")
                        .WithMany("Labels")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.LabelsNotes", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.Label", "Label")
                        .WithMany("LabelsNotes")
                        .HasForeignKey("LabelId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.Note", "Note")
                        .WithMany("LabelsNotes")
                        .HasForeignKey("NoteId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Label");

                    b.Navigation("Note");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Note", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.NoteType", "NoteType")
                        .WithMany("Notes")
                        .HasForeignKey("NoteTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.RefType", "RefType")
                        .WithMany("Notes")
                        .HasForeignKey("RefTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.User", "User")
                        .WithMany("Notes")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("NoteType");

                    b.Navigation("RefType");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.NoteContent.BaseNoteContent", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.Note", "Note")
                        .WithMany("Contents")
                        .HasForeignKey("NoteId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Note");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.NotificationSetting", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.User", "User")
                        .WithOne("NotificationSettings")
                        .HasForeignKey("Common.DatabaseModels.models.NotificationSetting", "UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.User", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.Backgrounds", "CurrentBackground")
                        .WithOne("CurrentUserBackground")
                        .HasForeignKey("Common.DatabaseModels.models.User", "CurrentBackgroundId");

                    b.HasOne("Common.DatabaseModels.models.FontSize", "FontSize")
                        .WithMany("Users")
                        .HasForeignKey("FontSizeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.Language", "Language")
                        .WithMany("Users")
                        .HasForeignKey("LanguageId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.AppFile", "Photo")
                        .WithOne("User")
                        .HasForeignKey("Common.DatabaseModels.models.User", "PhotoId");

                    b.HasOne("Common.DatabaseModels.models.Theme", "Theme")
                        .WithMany("Users")
                        .HasForeignKey("ThemeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("CurrentBackground");

                    b.Navigation("FontSize");

                    b.Navigation("Language");

                    b.Navigation("Photo");

                    b.Navigation("Theme");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.UserOnNoteNow", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.Note", "Note")
                        .WithMany("UserOnNotesNow")
                        .HasForeignKey("NoteId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.User", "User")
                        .WithMany("UserOnNotes")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Note");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.UserOnPrivateNotes", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.RefType", "AccessType")
                        .WithMany("UserOnPrivateNotes")
                        .HasForeignKey("AccessTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.Note", "Note")
                        .WithMany("UsersOnPrivateNotes")
                        .HasForeignKey("NoteId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.User", "User")
                        .WithMany("UserOnPrivateNotes")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("AccessType");

                    b.Navigation("Note");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.UsersOnPrivateFolders", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.RefType", "AccessType")
                        .WithMany("UsersOnPrivateFolders")
                        .HasForeignKey("AccessTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.Folder", "Folder")
                        .WithMany("UsersOnPrivateFolders")
                        .HasForeignKey("FolderId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Common.DatabaseModels.models.User", "User")
                        .WithMany("UsersOnPrivateFolders")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("AccessType");

                    b.Navigation("Folder");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.NoteContent.AlbumNote", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.NoteContent.BaseNoteContent", null)
                        .WithOne()
                        .HasForeignKey("Common.DatabaseModels.models.NoteContent.AlbumNote", "Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Common.DatabaseModels.models.NoteContent.TextNote", b =>
                {
                    b.HasOne("Common.DatabaseModels.models.NoteContent.BaseNoteContent", null)
                        .WithOne()
                        .HasForeignKey("Common.DatabaseModels.models.NoteContent.TextNote", "Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Common.DatabaseModels.models.AppFile", b =>
                {
                    b.Navigation("User");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Backgrounds", b =>
                {
                    b.Navigation("CurrentUserBackground");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Folder", b =>
                {
                    b.Navigation("FoldersNotes");

                    b.Navigation("UsersOnPrivateFolders");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.FolderType", b =>
                {
                    b.Navigation("Folders");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.FontSize", b =>
                {
                    b.Navigation("Users");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Label", b =>
                {
                    b.Navigation("LabelsNotes");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Language", b =>
                {
                    b.Navigation("Users");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Note", b =>
                {
                    b.Navigation("Contents");

                    b.Navigation("FoldersNotes");

                    b.Navigation("LabelsNotes");

                    b.Navigation("UserOnNotesNow");

                    b.Navigation("UsersOnPrivateNotes");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.NoteType", b =>
                {
                    b.Navigation("Notes");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.RefType", b =>
                {
                    b.Navigation("Folders");

                    b.Navigation("Notes");

                    b.Navigation("UserOnPrivateNotes");

                    b.Navigation("UsersOnPrivateFolders");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.Theme", b =>
                {
                    b.Navigation("Users");
                });

            modelBuilder.Entity("Common.DatabaseModels.models.User", b =>
                {
                    b.Navigation("Backgrounds");

                    b.Navigation("Folders");

                    b.Navigation("Labels");

                    b.Navigation("Notes");

                    b.Navigation("NotificationSettings");

                    b.Navigation("UserOnNotes");

                    b.Navigation("UserOnPrivateNotes");

                    b.Navigation("UsersOnPrivateFolders");
                });
#pragma warning restore 612, 618
        }
    }
}