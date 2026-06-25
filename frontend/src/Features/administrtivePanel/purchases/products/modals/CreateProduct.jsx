import ProductForm from '../components/ProductForm';

function CreateProduct(props) {
  return <ProductForm {...props} mode="create" onSuccess={props.onCreate} />;
}

export default CreateProduct;
