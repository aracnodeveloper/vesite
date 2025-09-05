import { useState } from "react";
import Button from "../../../shared/Button";
import { LinkImageDisplay } from "../SharedLinksComponents";
import LinkEditForm from "../../../layers/AddMoreSections/Links/Components/LinksEditForm";
import type { LinkData } from "../../../../interfaces/AdminData";
import { useFetchLinks } from "../../../../hooks/useFetchLinks";
import type { UpdateLinkDto } from ".././../../../interfaces/Links";
///home/adrian/Repos/vesite/src/interfaces/Links.ts

export default function EditableLink({
  link,
  key,
  linkType,
  formatDate,
}: {
  link: LinkData;
  key: number;
  linkType;
  formatDate;
}) {
  const [edit, setEdit] = useState(false);
  const [editLink, setEditLink] = useState(link);
  const { updateLink, deleteLink, toggleLinkStatus, loading, error } =
    useFetchLinks();

  const onSave = async () => {
    try {
      const updateData: UpdateLinkDto = {
        label: editLink.label,
        url: editLink.url,
        image: editLink.image,
        description: editLink.description,
        orderIndex: editLink.orderIndex,
        isActive: editLink.isActive,
      };
      await updateLink(editLink.id, updateData);
    } catch {}
  };

  return (
    <>
      {!edit ? (
        <div
          key={key}
          className="bg-white p-4 rounded border hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <LinkImageDisplay link={link} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {link.label || "Sin título"}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${linkType.color}`}
                  >
                    {linkType.icon}
                    <span className="ml-1">{linkType.type}</span>
                  </span>
                </div>
                <p className="text-xs text-blue-600 hover:text-blue-800 break-all mt-1">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {link.url.length > 50
                      ? `${link.url.substring(0, 50)}...`
                      : link.url}
                  </a>
                </p>
                {link.description && (
                  <p className="text-xs text-gray-400 mt-1 break-words">
                    {link.description}
                  </p>
                )}
                {link.color && (
                  <div className="flex items-center mt-2">
                    <div
                      className="w-4 h-4 rounded border mr-2"
                      style={{
                        backgroundColor: link.color,
                      }}
                    ></div>
                    <span className="text-xs text-gray-500">{link.color}</span>
                  </div>
                )}
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Orden: #{link.orderIndex || key + 1}</span>
                  <span>
                    ID: {link.id.substring(0, 8)}
                    ...
                  </span>
                  {link.createdAt && (
                    <span>Creado: {formatDate(link.createdAt)}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-y-5 items-end space-y-1 ml-4">
              <span
                className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                  link.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {link.isActive ? "Activo" : "Inactivo"}
              </span>
              <Button onClick={() => setEdit(true)}>Editar</Button>
            </div>
          </div>
        </div>
      ) : (
        <LinkEditForm
          link={editLink}
          editTitle={editLink.label}
          editUrl={editLink.url}
          editImage={editLink.image}
          isSubmitting={false}
          onTitleChange={(value) =>
            setEditLink((prev) => ({
              ...prev,
              ["label"]: value,
            }))
          }
          onUrlChange={(value) =>
            setEditLink((prev) => ({
              ...prev,
              ["url"]: value,
            }))
          }
          onImageChange={function (image: string | undefined): void {
            throw new Error("Function not implemented.");
          }}
          onSave={onSave}
          onCancel={() => setEdit(false)}
        />
      )}
    </>
  );
}
