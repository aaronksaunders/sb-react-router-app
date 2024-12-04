import { Form, Link } from "react-router";
import { getServerClient } from "~/server";
import { Route } from "./+types/crud";
import { useState, useEffect } from "react";

/**
 * Loader function to fetch items from the server.
 *
 * This function retrieves a list of items from the Supabase database
 * and returns them along with any potential errors.
 *
 * @param {Route.LoaderArgs} args - The loader arguments containing the request.
 * @returns {Promise<{ items: Array<Object>, error: string | null }>} An object containing the items and any error message.
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const sbServerClient = getServerClient(request);
  const { data: items, error } = await sbServerClient.from("items").select("*");
  return { items, error };
};

/**
 * Action function to handle adding and deleting items.
 *
 * This function processes form submissions for adding new items
 * and deleting existing items from the Supabase database.
 *
 * @param {Route.ActionArgs} args - The action arguments containing the request.
 * @returns {Promise<{ data: any, error: string | null }>} An object containing the result of the action and any error message.
 */
export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const sbServerClient = getServerClient(request);
    const formData = await request.formData();
    const actionType = formData.get("actionType");

    console.log("Action Type:", actionType); // Debugging log

    if (actionType === "addItem") {
      const name = formData.get("name");
      const description = formData.get("description");
      console.log("Adding Item:", { name, description }); // Debugging log

      const { data, error } = await sbServerClient
        .from("items")
        .insert({
          name,
          description,
        })
        .select("*");

      if (error) {
        console.error("Error adding item:", error); // Debugging log
        return { error: error.message };
      }

      return { data: data?.length > 0 ? data[0] : null };
    }

    if (actionType === "editItem") {
      const id = formData.get("id");
      const name = formData.get("name");
      const description = formData.get("description");

      const { data, error } = await sbServerClient
        .from("items")
        .update({ name, description })
        .eq("id", id)
        .select("*");

      if (error) {
        console.error("Error editing item:", error); // Debugging log
        return { error: error.message };
      }

      return { data: data?.length > 0 ? data[0] : null };
    }

    if (actionType === "deleteItem") {
      const id = formData.get("id");
      const { data, error } = await sbServerClient
        .from("items")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting item:", error); // Debugging log
        return { error: error.message };
      }

      return { data: null };
    }

    return { data: null, error: "Invalid action type" };
  } catch (error) {
    console.error("An error occurred:", error); // Debugging log
    return { data: null, error: "An error occurred" };
  }
};

/**
 * Crud route component.
 * This component displays the CRUD page of the application.
 * It includes a form for adding items and a list of items.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.loaderData - Data returned from the loader function, including the list of items.
 * @param {Object} props.actionData - Data returned from the action function, including any error messages.
 * @returns {JSX.Element} The rendered CRUD component.
 */
export default function Crud({ loaderData, actionData }: Route.ComponentProps) {
  const items = loaderData?.items;
  const error = (actionData as { error: string | null })?.error;

  // State to manage the current item being edited or created
  const [currentItem, setCurrentItem] = useState<{
    id: number;
    name: string;
    description: string;
  } | null>(null);

  // State to determine if we are in edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Effect to reset the form when actionData changes
  useEffect(() => {
    if (actionData && !actionData.error) {
      // Reset the current item if the action was successful
      setCurrentItem(null);
      setIsEditing(false); // Reset edit mode
    }
  }, [actionData]);

  // Function to handle edit button click
  const handleEditClick = (item: any) => {
    setCurrentItem(item);
    setIsEditing(true); // Set edit mode
  };

  // Function to handle cancel edit
  const handleCancelEdit = () => {
    setCurrentItem(null);
    setIsEditing(false); // Reset edit mode
  };

  return (
    <div className="flex flex-col p-8 min-w-3/4 w-[500px] justify-center items-center mx-auto">
      <p className="text-center">
        This is a simple example of a CRUD application using React Router and
        Supabase.
      </p>
      <div className="text-sm">
        <Link to="/home" className="text-blue-500">
          Go Home
        </Link>
      </div>
      <div className="mt-4">
        <div className="flex flex-col gap-2 border border-gray-300 p-4 rounded-md">
          {error && <p className="text-red-500">{error}</p>}
          <Form method="post">
            <input
              type="hidden"
              name="actionType"
              value={isEditing ? "editItem" : "addItem"}
            />
            {isEditing && (
              <input type="hidden" name="id" value={currentItem?.id} />
            )}
            <div className="flex flex-col gap-2 w-[300px]">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={currentItem ? currentItem.name : ""}
                onChange={(e) => {
                  const newName = e.target.value;
                  setCurrentItem((prev) => ({
                    id: prev ? prev.id : 0, // Keep the existing id if editing, otherwise set to 0
                    name: newName,
                    description: prev ? prev.description : "", // Maintain previous description if editing
                  }));
                }}
                className="border border-gray-300 p-1 rounded-md mr-2 flex-1"
                required
              />
              <textarea
                rows={3}
                name="description"
                placeholder="Description"
                value={currentItem ? currentItem.description : ""}
                onChange={(e) => {
                  const newDescription = e.target.value;
                  setCurrentItem((prev) => ({
                    id: prev ? prev.id : 0, // Keep the existing id if editing, otherwise set to 0
                    name: prev ? prev.name : "", // Maintain previous name if editing
                    description: newDescription,
                  }));
                }}
                className="border border-gray-300 p-1 rounded-md flex-1"
                required
              />
            </div>
            <div className="mt-2">
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-md text-sm"
              >
                {isEditing ? "Save Changes" : "Add Item"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-500 text-white p-2 rounded-md text-sm ml-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </Form>
        </div>
        {/* List of items */}
        <div className="flex flex-col gap-2 mt-4">
          {items?.map((item: any) => (
            <div
              key={item.id}
              className="border border-gray-300 p-4 rounded-md flex flex-row justify-between"
            >
              <div className="flex flex-col gap-2">
                <div className="font-bold capitalize">{item.name}</div>
                <div className="text-sm">{item.description}</div>
              </div>
              <div className="flex flex-col">
                <button
                  onClick={() => handleEditClick(item)}
                  className="bg-yellow-500 text-white p-1 rounded-md text-[10px] h-6 px-2 font-bold"
                >
                  Edit
                </button>
                <Form method="post">
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="actionType" value="deleteItem" />
                  <button
                    type="submit"
                    className="bg-red-500 text-white p-1 rounded-md text-[10px] h-6 px-2 font-bold"
                  >
                    Delete
                  </button>
                </Form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
