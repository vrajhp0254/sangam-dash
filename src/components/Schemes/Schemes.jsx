/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Chip,
  Button,
  Input,
} from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Eye, Pen, PlusCircle, Trash } from "@phosphor-icons/react";
import { NavLink, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const API_BASE_URL = "https://mehdb.vercel.app";

const ConsolidatedSchemeList = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState({
    isOpen: false,
    schemeDetails: null,
    editMode: false,
    deleteMode: false,
  });
  const [editedScheme, setEditedScheme] = useState({});

  const fetchSchemes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/getschemes`, {
        withCredentials: true,
      });

      console.log(res.data);
      if (res.status !== 200) {
        navigate("/login");
        const error = new Error(res.error);
        throw error;
      }
      setSchemes(res.data.schemes);
      console.log("Schemes:", schemes);
    } catch (error) {
      // navigate("/login")
      setError(error.message);
      console.error(error);
    }
  };

  const handleView = (schemeDetails) => {
    console.log("View Scheme:", schemeDetails);
    setModalData({
      isOpen: true,
      schemeDetails,
    });
  };

  const handleEdit = (schemeDetails) => {
    console.log("Edit Scheme:", schemeDetails);
    setEditedScheme({ ...schemeDetails });
    setModalData({
      isOpen: true,
      schemeDetails,
      editMode: true,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/updatescheme/${editedScheme._id}`,
        editedScheme,
        {
          withCredentials: true,
        }
      );

      console.log(res.data);

      if (res.status !== 200) {
        const error = new Error(res.error);
        throw error;
      }

      setSchemes((prevSchemes) =>
        prevSchemes.map((scheme) =>
          scheme._id === editedScheme._id ? editedScheme : scheme
        )
      );

      setModalData({
        ...modalData,
        isOpen: false,
      });

      // Use react-hot-toast's promise property to handle toast after it is dismissed
      const successToast = toast.success("Scheme edited successfully!");
      await successToast.promise;

      // Now you can navigate after the toast is dismissed
    } catch (error) {
      toast.error("Error editing scheme!");
      navigate("/login");
    }
  };

  const handleDelete = (schemeDetails) => {
    console.log("Delete Scheme:", schemeDetails);
    setEditedScheme({ ...schemeDetails });
    setModalData({
      isOpen: true,
      schemeDetails,
      deleteMode: true,
    });
  };

  const handleConfirmDelete = async () => {
    console.log("Confirm Delete Scheme:", editedScheme._id);

    if (!editedScheme._id) {
      console.error("Invalid scheme ID for deletion");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/deletescheme/${editedScheme._id}`,
        editedScheme,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setSchemes((prevSchemes) =>
          prevSchemes.filter((scheme) => scheme._id !== editedScheme._id)
        );
        setModalData({
          ...modalData,
          isOpen: false,
        });
        const successToast = toast.success("Scheme deleted successfully!");
        await successToast.promise;
      } else {
        toast.error("Failed to delete scheme.");
      }
    } catch (error) {
      toast.error("Error deleting scheme:", error.message);
    }
  };

  const handleCloseModal = () => {
    console.log("Close Modal");
    setModalData({
      isOpen: false,
      schemeDetails: null,
      editMode: false,
      deleteMode: false,
    });
    setEditedScheme({});
  };

  useEffect(() => {
    console.log("Fetch Schemes");
    fetchSchemes();
  }, []);

  return (
    <div className="border rounded-lg border-gray-600">
      <div>
        <Toaster />
      </div>
      <Chip
        className=" my-2 flex mx-auto text-medium font-mono"
        variant="bordered"
        size="lg"
        color="primary"
        avatar={<PlusCircle size={20} weight="duotone" />}
      >
        <NavLink to="/addscheme" className="">
          <p>Add Scheme</p>
        </NavLink>
      </Chip>
      {error && (
        <Chip
          variant="dot"
          color="danger"
          className="my-2 flex mx-auto text-red-700 text-medium font-mono"
        >
          Error: {error}
        </Chip>
      )}
      <Table border="primary" aria-label="Scheme Table">
        <TableHeader>
          <TableColumn>Sr. No.</TableColumn>
          <TableColumn>Scheme Name</TableColumn>
          <TableColumn>Ministry</TableColumn>
          <TableColumn>Description</TableColumn>
          <TableColumn>Place</TableColumn>
          <TableColumn>TOS Added</TableColumn>
          <TableColumn>Date</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {schemes.map((scheme) => (
            <TableRow key={scheme._id}>
              <TableCell>{scheme.srno}</TableCell>
              <TableCell>{scheme.schemename}</TableCell>
              <TableCell>{scheme.ministry}</TableCell>
              <TableCell>{scheme.desc}</TableCell>
              <TableCell>{scheme.place}</TableCell>
              <TableCell>{scheme.moneygranted}</TableCell>
              <TableCell>{scheme.moneyspent}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Tooltip content="View Scheme">
                    <Chip onClick={() => handleView(scheme)} color="primary">
                      <Eye size={20} weight="duotone" />
                    </Chip>
                  </Tooltip>
                  <Tooltip content="Edit Scheme">
                    <Chip onClick={() => handleEdit(scheme)} color="warning">
                      <Pen size={20} weight="duotone" />
                    </Chip>
                  </Tooltip>
                  <Tooltip content="Delete Scheme">
                    <Chip onClick={() => handleDelete(scheme)} color="danger">
                      <Trash size={20} weight="duotone" />
                    </Chip>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <SchemeModal
        modalData={modalData}
        editedScheme={editedScheme}
        onEdit={handleSaveEdit}
        onDelete={handleConfirmDelete}
        onClose={handleCloseModal}
        onInputChange={(field, value) =>
          setEditedScheme({ ...editedScheme, [field]: value })
        }
      />
    </div>
  );
};

const SchemeModal = ({
  modalData,
  editedScheme,
  onEdit,
  onDelete,
  onClose,
  onInputChange,
}) => {
  const { isOpen, schemeDetails, editMode, deleteMode } = modalData;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {editMode && (
          <ModalHeader>Edit Scheme: {editedScheme.schemename}</ModalHeader>
        )}
        {deleteMode && <ModalHeader>Delete Scheme</ModalHeader>}
        <ModalBody>
          {schemeDetails && (
            <>
              <p>{schemeDetails.desc}</p>
              <p>Ministry: {schemeDetails.ministry}</p>
              <p>Place: {schemeDetails.place}</p>
              <p>Time of Scheme Added: {schemeDetails.timeOfschemeAdded}</p>
              <p>Date: {schemeDetails.date}</p>
            </>
          )}
          {editMode && (
            <>
              <Input
                label="Scheme Name"
                value={editedScheme.schemename}
                onChange={(e) => onInputChange("schemename", e.target.value)}
              />
              <Input
                label="Ministry"
                value={editedScheme.ministry}
                onChange={(e) => onInputChange("ministry", e.target.value)}
              />
              <Input
                label="Description"
                value={editedScheme.desc}
                onChange={(e) => onInputChange("desc", e.target.value)}
              />
              <Input
                label="Place"
                value={editedScheme.place}
                onChange={(e) => onInputChange("place", e.target.value)}
              />
              {/* Add other input fields for editing scheme details */}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {editMode && (
            <>
              <Button color="primary" onPress={onEdit}>
                Save Changes
              </Button>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
            </>
          )}
          {deleteMode && (
            <>
              <Button color="primary" onPress={onDelete}>
                Confirm Delete
              </Button>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConsolidatedSchemeList;
