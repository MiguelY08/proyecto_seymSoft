import ProductForm from '../components/ProductForm';

function EditProduct(props) {
  return <ProductForm {...props} mode="edit" onSuccess={props.onUpdate} />;
}

export default EditProduct;
