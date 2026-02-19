const CreateActions = ({ handleCancel, handleSave }) => {
  return (
    <div className="flex justify-end gap-4 mt-6">
      <button
        onClick={handleCancel}
        className="px-6 py-2 border border-gray-400 rounded-lg hover:bg-gray-100 transition-all"
      >
        Cancelar
      </button>

      <button
        onClick={handleSave}
        className="px-6 py-2 bg-[#004D77] text-white rounded-lg hover:bg-[#003a5c] transition-all"
      >
        Guardar Compra
      </button>
    </div>
  );
};

export default CreateActions;
