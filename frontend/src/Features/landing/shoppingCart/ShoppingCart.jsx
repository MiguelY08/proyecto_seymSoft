import { useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart as CartIcon,
  Minus,
  Plus,
  Trash2,
  MapPin,
  Mail,
  Phone,
  Home as HomeIcon,
  Store,
  MessageSquare,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  SquarePen,
  UserRound,
  LoaderCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/Context/CartContext';
import { useAlert } from '../../shared/alerts/useAlert';
import useAuthenticatedClient from '../../shared/hooks/useAuthenticatedClient';
import { getDisplayPricing, normalizeClientType } from '../../shared/utils/shopPricingHelper';
import CompletePay from './modals/CompletePay.jsx';
import CompleteClientProfile from './modals/CompleteClientProfile.jsx';
import { useAuth } from '../../access/context/AuthContext';
import { getSession, saveSession } from '../../access/helpers/authStorage';
import FormSelect from '../../shared/FormSelect';
import { getProfileSummary } from '../../shared/services/profileService';
import {
  ESTADOS_LOGISTICOS,
  LocationService,
  ORIGENES,
  OrdersService,
} from '../../administrtivePanel/sales/orders/services/ordersService';
import { getProductBarcode } from '../orders/helpers/customerOrderHelpers';

const buildDeliveryAddress = (deliveryInfo = {}) => {
  const addressParts = [
    deliveryInfo?.direccion,
    deliveryInfo?.ciudadEntregaNombre || deliveryInfo?.ciudad,
    deliveryInfo?.departamentoEntregaNombre,
  ]
    .map((part) => String(part || '').trim())
    .filter(Boolean);

  const notes = String(deliveryInfo?.notas || '').trim();
  const address = addressParts.join(', ');

  if (!address) return notes;
  return notes ? `${address} (${notes})` : address;
};

const buildCheckoutProducts = (items = []) =>
  items.map((item) => ({
    id: Number(item.id),
    codBarras: getProductBarcode(item),
    cantidad: Number(item.quantity || 0),
    precioUnitario: Number(item.price || 0),
  }));

const pickNumber = (source, keys = []) => {
  for (const key of keys) {
    const parsed = Number(source?.[key]);
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
};

const PICKUP_STORE_LOCATION = {
  name: 'Papelería Magic',
  city: 'Medellín, Colombia',
  address: 'Cra. 55 #46-64 (La Candelaria)',
  place: 'CC Manhattan Plaza',
  details: 'Local 112 · Ventas 1102',
  mapUrl:
    'https://www.google.com/maps/place/Centro+Comercial+Manhatan+Plaza/@6.2491669,-75.5729839,360m/data=!3m1!1e3!4m6!3m5!1s0x8e4428fff68501a1:0x23df4219000eef2d!8m2!3d6.249001!4d-75.5731081!16s%2Fg%2F1v4k7kjj?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D',
};

/* ── Estilos (coherentes con Home/Favorites) ── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,600&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes cart-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cart-emptyFloat {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }

  .cart-page {
    background: #f6f9fc;
    font-family: 'Nunito', 'Segoe UI', sans-serif;
    min-height: 100vh;
  }

  .cart-container {
    max-width: var(--store-content-max);
    margin: 0 auto;
    padding: clamp(18px, 3vw, 30px) var(--store-content-x);
  }

  /* Header */
  .cart-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
    flex-wrap: wrap;
  }
  .cart-icon-circle {
    width: 42px;
    height: 42px;
    background: linear-gradient(140deg, #e8f4fd 0%, #d4ebf8 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cart-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.45rem, 3vw, 1.9rem);
    font-weight: 700;
    color: #0c2a3a;
    margin: 0;
  }

  /* Botones acción */
  .cart-action-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 22px;
    flex-wrap: wrap;
  }
  .btn-secondary {
    background: #ffffff;
    border: 1.5px solid #e2edf5;
    border-radius: 40px;
    padding: 7px 16px;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    font-size: 0.68rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #1e4060;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-secondary:hover {
    border-color: #afd0e6;
    background: #f0f8ff;
    transform: translateY(-1px);
  }
  .btn-primary {
    background: #004D77;
    border: 2px solid #004D77;
    border-radius: 40px;
    padding: 7px 18px;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    font-size: 0.68rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-primary:hover {
    background: transparent;
    color: #004D77;
    transform: translateY(-1px);
  }

  /* Tarjeta producto */
  .cart-item-card {
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 16px;
    padding: 12px;
    margin-bottom: 10px;
    transition: box-shadow 0.25s ease, transform 0.25s ease;
    animation: cart-fadeUp 0.4s ease both;
  }
  .cart-item-card:hover {
    box-shadow: 0 8px 28px rgba(0, 77, 119, 0.1);
    transform: translateY(-2px);
    border-color: #afd0e6;
  }
  .cart-item-inner {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }
  .cart-item-img {
    width: 66px;
    height: 66px;
    background: linear-gradient(150deg, #eef6fb 0%, #e0eef7 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }
  .cart-item-img img {
    width: 70%;
    height: 70%;
    object-fit: contain;
  }
  .cart-item-info {
    flex: 2;
    min-width: 150px;
  }
  .cart-item-name {
    font-weight: 800;
    font-size: 0.86rem;
    color: #0c2a3a;
    cursor: pointer;
    margin-bottom: 4px;
  }
  .cart-item-name:hover {
    color: #004D77;
  }
  .cart-item-category {
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #9abcce;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
  }
  .cart-item-price {
    font-size: 1rem;
    font-weight: 900;
    color: #004D77;
  }
  .cart-item-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }
  .quantity-control {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f8fafc;
    padding: 3px 7px;
    border-radius: 40px;
    border: 1px solid #e2edf5;
  }
  .qty-btn {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 1px solid #e2edf5;
    cursor: pointer;
    transition: all 0.15s;
  }
  .qty-btn:hover {
    background: #eef6fb;
    border-color: #afd0e6;
  }
  .qty-number {
    font-weight: 800;
    min-width: 24px;
    font-size: 0.78rem;
    text-align: center;
  }
  .item-total {
    font-weight: 900;
    font-size: 0.92rem;
    color: #0c2a3a;
  }
  .delete-btn {
    background: none;
    border: none;
    color: #9abcce;
    cursor: pointer;
    font-size: 0.64rem;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;
  }
  .delete-btn:hover {
    color: #e53e3e;
  }

  /* Tarjeta de resumen / formulario */
  .summary-card, .delivery-form-card {
    background: #ffffff;
    border: 1.5px solid #e4eff6;
    border-radius: 18px;
    padding: 18px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
  }
  .summary-title, .form-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.12rem;
    font-weight: 700;
    color: #0c2a3a;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .delivery-method-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 18px;
  }
  .method-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 10px;
    border: 2px solid #e2edf5;
    border-radius: 14px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }
  .method-option.active {
    border-color: #004D77;
    background: #f0f8ff;
  }
  .method-icon {
    width: 26px;
    height: 26px;
    color: #9abcce;
  }
  .method-option.active .method-icon {
    color: #004D77;
  }
  .method-label {
    font-weight: 800;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Formulario */
  .form-group {
    margin-bottom: 13px;
  }
  .form-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.68rem;
    font-weight: 800;
    color: #1e4060;
    margin-bottom: 6px;
  }
  .recipient-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 6px;
  }
  .recipient-label-row .form-label {
    margin-bottom: 0;
  }
  .btn-recipient-helper {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 1.5px solid #d8e8f2;
    border-radius: 999px;
    background: #ffffff;
    color: #004D77;
    font-size: 0.68rem;
    font-weight: 800;
    padding: 5px 9px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
  }
  .btn-recipient-helper:hover:not(:disabled) {
    background: #f0f8ff;
    border-color: #afd0e6;
    transform: translateY(-1px);
  }
  .btn-recipient-helper:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  .form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1.5px solid #e2edf5;
    border-radius: 11px;
    font-family: 'Nunito', sans-serif;
    font-size: 0.76rem;
    transition: all 0.2s;
    background: #ffffff;
  }
  .form-input:focus {
    outline: none;
    border-color: #004D77;
    box-shadow: 0 0 0 3px rgba(0, 77, 119, 0.1);
  }
  .form-input:disabled {
    background: #f4f8fb;
    color: #64748b;
    cursor: not-allowed;
  }
  .form-input.error {
    border-color: #f56565;
  }
  .form-input.success {
    border-color: #48bb78;
  }
  .profile-edit-row {
    display: flex;
    justify-content: flex-end;
    margin: -4px 0 12px;
  }
  .btn-profile-edit {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1.5px solid #e2edf5;
    border-radius: 999px;
    background: #ffffff;
    color: #004D77;
    cursor: pointer;
    font-family: 'Nunito', sans-serif;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    padding: 7px 12px;
    text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .btn-profile-edit:hover {
    background: #f0f8ff;
    border-color: #afd0e6;
    transform: translateY(-1px);
  }
  .error-message {
    font-size: 0.64rem;
    color: #f56565;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .price-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 9px;
    font-size: 0.78rem;
  }
  .total-row {
    border-top: 1px solid #e2edf5;
    margin-top: 12px;
    padding-top: 12px;
    font-weight: 900;
    font-size: 1rem;
  }
  .shipping-pending-value {
    color: #b45309;
    font-weight: 900;
    text-align: right;
  }
  .shipping-pending-note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #fff7ed;
    border: 1.5px solid #fed7aa;
    border-radius: 12px;
    color: #92400e;
    font-size: 0.72rem;
    font-weight: 800;
    line-height: 1.35;
    padding: 10px 12px;
    margin: 12px 0 4px;
  }
  .shipping-pending-note svg {
    flex: 0 0 auto;
    margin-top: 1px;
  }
  .pickup-store-info {
    display: flex;
    gap: 10px;
    background: linear-gradient(140deg, #f2f9fd 0%, #ffffff 100%);
    border: 1.5px solid #d9eaf4;
    border-radius: 14px;
    padding: 12px;
    margin: 2px 0 14px;
  }
  .pickup-store-icon {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: #e6f3fb;
    color: #004D77;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }
  .pickup-store-content {
    min-width: 0;
    color: #466474;
    font-size: 0.72rem;
    line-height: 1.45;
  }
  .pickup-store-title {
    color: #0c2a3a;
    font-size: 0.7rem;
    font-weight: 900;
    letter-spacing: 0.06em;
    margin: 0 0 5px;
    text-transform: uppercase;
  }
  .pickup-store-line {
    margin: 0;
    overflow-wrap: anywhere;
  }
  .pickup-store-line strong {
    color: #1e4060;
    font-weight: 900;
  }
  .pickup-store-map {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #004D77;
    font-size: 0.68rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    margin-top: 8px;
    text-decoration: none;
    text-transform: uppercase;
  }
  .pickup-store-map:hover {
    color: #0c5c88;
    text-decoration: underline;
  }
  .btn-checkout {
    width: 100%;
    background: #004D77;
    color: white;
    border: none;
    border-radius: 40px;
    padding: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
    font-size: 0.74rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 12px;
  }
  .btn-checkout:hover {
    background: #0c5c88;
    transform: translateY(-2px);
  }
  .btn-checkout:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  /* Empty state (estilo Favorites) */
  .cart-empty {
    text-align: center;
    padding: clamp(48px, 10vw, 96px) 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    animation: cart-fadeUp 0.5s ease;
  }
  .cart-empty-icon {
    width: 66px;
    height: 66px;
    border-radius: 50%;
    background: linear-gradient(150deg, #eef6fb, #e0eef7);
    border: 1.5px solid #e2edf5;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: cart-emptyFloat 3s ease-in-out infinite;
  }
  .cart-empty-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.2rem, 2.5vw, 1.55rem);
    font-weight: 700;
    color: #0c2a3a;
    margin: 0;
  }
  .cart-empty-sub {
    font-size: 0.78rem;
    color: #64748b;
    max-width: 320px;
    line-height: 1.6;
    margin: 0;
  }
  .btn-outline {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 20px;
    border: 2px solid #004D77;
    color: #004D77;
    font-family: 'Nunito', sans-serif;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border-radius: 100px;
    text-decoration: none;
    background: transparent;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.15s;
  }
  .btn-outline:hover {
    background: #004D77;
    color: #fff;
    transform: translateY(-1px);
  }
  .btn-outline:active {
    transform: scale(0.97);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .cart-item-inner {
      display: grid;
      grid-template-columns: 58px minmax(0, 1fr);
      align-items: start;
      gap: 10px;
    }
    .cart-item-img {
      width: 58px;
      height: 58px;
      border-radius: 10px;
    }
    .cart-item-info {
      min-width: 0;
    }
    .cart-item-name {
      line-height: 1.3;
    }
    .cart-item-actions {
      grid-column: 1 / -1;
      width: 100%;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
      border-top: 1px solid #eef2f6;
    }
    .item-total {
      white-space: nowrap;
    }
    .delete-btn {
      white-space: nowrap;
    }
    .cart-item-card:hover {
      transform: none;
    }
    .delivery-method-grid {
      grid-template-columns: 1fr;
    }
    .pickup-store-info {
      padding: 11px;
    }
    .pickup-store-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
    }
  }
  @media (max-width: 380px) {
    .cart-item-actions {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 8px 10px;
    }
    .item-total {
      justify-self: end;
    }
    .delete-btn {
      grid-column: 1 / -1;
      justify-self: end;
    }
  }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

const getClientFullName = (client) => (
  client?.fullName
  || [client?.firstName, client?.lastName].filter(Boolean).join(' ')
);

const firstText = (...values) => {
  const value = values.find((item) => String(item ?? '').trim());
  return String(value ?? '').trim();
};

const getProfileAddress = (user, client) => firstText(
  client?.address,
  client?.direccion,
  client?.deliveryAddress,
  client?.delivery_address,
  user?.client?.address,
  user?.client?.direccion,
  user?.client?.deliveryAddress,
  user?.client?.delivery_address,
  user?.customer?.address,
  user?.customer?.direccion,
  user?.customer?.deliveryAddress,
  user?.customer?.delivery_address,
  user?.address,
  user?.direccion,
  user?.deliveryAddress,
  user?.delivery_address,
);

function ShoppingCart() {
  injectStyles();
  const navigate = useNavigate();
  const { showConfirm, showError, showSuccess } = useAlert();
  const { user, client, setClient } = useAuth();
  const {
    clientId,
    clientType: resolvedClientType,
    isAuthenticated,
    loading: clientLoading,
  } = useAuthenticatedClient();
  const clientType = normalizeClientType(resolvedClientType);
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    removeFromCart,
    clearCart,
    loading: cartLoading,
  } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState('tienda');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [resumeCheckout, setResumeCheckout] = useState(false);
  const [isDeliverySubmitting, setIsDeliverySubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correo: '',
    telefono: '',
    deliveryRecipientName: '',
    deliveryRecipientPhone: '',
    departamentoEntregaCodigo: '',
    departamentoEntregaNombre: '',
    ciudadEntregaCodigo: '',
    ciudadEntregaNombre: '',
    ciudad: '',
    barrio: '',
    direccion: '',
    notas: '',
  });
  const [errors, setErrors] = useState({
    nombreCompleto: '',
    correo: '',
    telefono: '',
    deliveryRecipientName: '',
    deliveryRecipientPhone: '',
    departamentoEntregaCodigo: '',
    ciudadEntregaCodigo: '',
    ciudad: '',
    barrio: '',
    direccion: '',
  });
  const [touched, setTouched] = useState({
    nombreCompleto: false,
    correo: false,
    telefono: false,
    deliveryRecipientName: false,
    deliveryRecipientPhone: false,
    departamentoEntregaCodigo: false,
    ciudadEntregaCodigo: false,
    ciudad: false,
    barrio: false,
    direccion: false,
  });
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [favorBalance, setFavorBalance] = useState(0);

  const preloadedCustomerData = useMemo(() => ({
    nombreCompleto: String(user?.fullName || getClientFullName(client) || '').trim(),
    correo: String(user?.email || client?.email || '').trim(),
    telefono: String(user?.phone || client?.phone || '').trim(),
    direccionPerfil: getProfileAddress(user, client),
  }), [
    client,
    user,
  ]);

  const profileAddress = preloadedCustomerData.direccionPerfil;

  useEffect(() => {
    let isMounted = true;

    const loadDepartments = async () => {
      try {
        setLoadingDepartamentos(true);
        const departments = await LocationService.getDepartments();
        if (isMounted) setDepartamentos(departments);
      } catch {
        if (isMounted) {
          setDepartamentos([]);
          showError('Error', 'No se pudieron cargar los departamentos.');
        }
      } finally {
        if (isMounted) setLoadingDepartamentos(false);
      }
    };

    loadDepartments();

    return () => {
      isMounted = false;
    };
  }, [showError]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...preloadedCustomerData,
      direccion: touched.direccion ? prev.direccion : prev.direccion || profileAddress,
    }));
  }, [preloadedCustomerData, profileAddress, touched.direccion]);

  useEffect(() => {
    if (deliveryMethod !== 'domicilio' || !formData.departamentoEntregaCodigo) {
      setCiudades([]);
      return undefined;
    }

    let isMounted = true;

    const loadCities = async () => {
      try {
        setLoadingCiudades(true);
        const cities = await LocationService.getCitiesByDepartment(formData.departamentoEntregaCodigo);
        if (isMounted) setCiudades(cities);
      } catch {
        if (isMounted) {
          setCiudades([]);
          showError('Error', 'No se pudieron cargar los municipios del departamento.');
        }
      } finally {
        if (isMounted) setLoadingCiudades(false);
      }
    };

    loadCities();

    return () => {
      isMounted = false;
    };
  }, [deliveryMethod, formData.departamentoEntregaCodigo, showError]);

  useEffect(() => {
    if (!resumeCheckout || !clientId || cartLoading || cartItems.length === 0) return;
    const timer = window.setTimeout(() => {
      setResumeCheckout(false);
      if (deliveryMethod === 'domicilio') {
        handleDeliveryCheckout();
        return;
      }
      setShowPaymentModal(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [cartItems.length, cartLoading, clientId, deliveryMethod, resumeCheckout]);

  useEffect(() => {
    if (!isAuthenticated || !clientId) {
      setFavorBalance(0);
      return;
    }

    let alive = true;

    const loadFavorBalance = async () => {
      try {
        const profile = await getProfileSummary();
        const financialSummary = profile?.financialSummary || profile || {};
        const balance = pickNumber(financialSummary, [
          'favorBalance',
          'saldoFavor',
          'credit_balance',
          'saldo_a_favor',
          'balance',
        ]);

        if (alive) {
          setFavorBalance(Math.max(0, balance));
        }
      } catch (error) {
        console.error('No fue posible cargar el saldo a favor:', error);
        if (alive) {
          setFavorBalance(0);
        }
      }
    };

    void loadFavorBalance();

    return () => {
      alive = false;
    };
  }, [clientId, isAuthenticated]);

  // Validaciones (idénticas al original)
  const validateNombreCompleto = (value) => {
    if (!value.trim()) return 'El nombre completo es obligatorio';
    if (value.trim().length < 3) return 'Mínimo 3 caracteres';
    if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) return 'Solo letras';
    if (value.trim().split(/\s+/).length < 2) return 'Ingresa nombre y apellido';
    return '';
  };
  const validateCorreo = (value) => {
    if (!value.trim()) return 'El correo es obligatorio';
    if (!value.includes('@')) return 'Debe contener @';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) return 'Formato inválido';
    return '';
  };
  const validateTelefono = (value) => {
    if (!value.trim()) return 'El teléfono es obligatorio';
    if (!/^\d+$/.test(value)) return 'El teléfono solo debe contener números';
    if (!/^\d{7,10}$/.test(value)) return 'El teléfono debe contener entre 7 y 10 dígitos numéricos.';
    return '';
  };
  const validateDeliveryRecipientName = (value) => {
    if (!value.trim()) return 'La persona que recibe o recoge es obligatoria';
    if (value.trim().length < 3) return 'Mínimo 3 caracteres';
    return '';
  };
  const validateDepartamentoEntrega = (value) => {
    if (!String(value || '').trim()) return 'El departamento es obligatorio';
    return '';
  };
  const validateCiudadEntrega = (value) => {
    if (!String(value || '').trim()) return 'El municipio/ciudad es obligatorio';
    return '';
  };
  const validateCiudad = (value) => {
    if (!value.trim()) return 'La ciudad es obligatoria';
    if (value.trim().length < 3) return 'Mínimo 3 caracteres';
    if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) return 'Solo letras';
    return '';
  };
  const validateDireccion = (value) => {
    if (!value.trim()) return 'La dirección es obligatoria';
    if (value.trim().length < 5) return 'Mínimo 5 caracteres';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefono' || name === 'deliveryRecipientPhone') {
      if (/\D/.test(value)) {
        setTouched((prev) => ({ ...prev, [name]: true }));
        setErrors((prev) => ({ ...prev, [name]: 'El teléfono solo debe contener números' }));
        return;
      }

      const cleaned = value.slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
      if (touched[name]) {
        setErrors((prev) => ({ ...prev, [name]: validateTelefono(cleaned) }));
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      let error = '';
      switch (name) {
        case 'nombreCompleto':
          error = validateNombreCompleto(value);
          break;
        case 'correo':
          error = validateCorreo(value);
          break;
        case 'deliveryRecipientName':
          error = validateDeliveryRecipientName(value);
          break;
        case 'ciudad':
          error = validateCiudad(value);
          break;
        case 'direccion':
          error = validateDireccion(value);
          break;
        default:
          break;
      }
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    let error = '';
    switch (name) {
      case 'nombreCompleto':
        error = validateNombreCompleto(formData.nombreCompleto);
        break;
      case 'correo':
        error = validateCorreo(formData.correo);
        break;
      case 'telefono':
        error = validateTelefono(formData.telefono);
        break;
      case 'deliveryRecipientName':
        error = validateDeliveryRecipientName(formData.deliveryRecipientName);
        break;
      case 'deliveryRecipientPhone':
        error = validateTelefono(formData.deliveryRecipientPhone);
        break;
      case 'departamentoEntregaCodigo':
        error = validateDepartamentoEntrega(formData.departamentoEntregaCodigo);
        break;
      case 'ciudadEntregaCodigo':
        error = validateCiudadEntrega(formData.ciudadEntregaCodigo);
        break;
      case 'ciudad':
        error = validateCiudad(formData.ciudad);
        break;
      case 'direccion':
        error = validateDireccion(formData.direccion);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {
      ...(deliveryMethod === 'domicilio'
        ? {
            deliveryRecipientName: validateDeliveryRecipientName(formData.deliveryRecipientName),
            deliveryRecipientPhone: validateTelefono(formData.deliveryRecipientPhone),
            departamentoEntregaCodigo: validateDepartamentoEntrega(formData.departamentoEntregaCodigo),
            ciudadEntregaCodigo: validateCiudadEntrega(formData.ciudadEntregaCodigo),
            direccion: validateDireccion(formData.direccion),
          }
        : {}),
    };
    setErrors((prev) => ({ ...prev, ...newErrors }));
    setTouched((prev) => ({
      ...prev,
      ...(deliveryMethod === 'domicilio'
        ? {
            deliveryRecipientName: true,
            deliveryRecipientPhone: true,
            departamentoEntregaCodigo: true,
            ciudadEntregaCodigo: true,
            direccion: true,
          }
        : {}),
    }));
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleDepartamentoEntregaChange = (departmentCode) => {
    const selectedDepartment = departamentos.find((department) => String(department.code) === String(departmentCode));

    setFormData((prev) => ({
      ...prev,
      departamentoEntregaCodigo: departmentCode,
      departamentoEntregaNombre: selectedDepartment?.name || '',
      ciudadEntregaCodigo: '',
      ciudadEntregaNombre: '',
      ciudad: '',
    }));
    setTouched((prev) => ({
      ...prev,
      departamentoEntregaCodigo: true,
      ciudadEntregaCodigo: false,
    }));
    setErrors((prev) => ({
      ...prev,
      departamentoEntregaCodigo: validateDepartamentoEntrega(departmentCode),
      ciudadEntregaCodigo: '',
      ciudad: '',
    }));
  };

  const handleCiudadEntregaChange = (cityCode) => {
    const selectedCity = ciudades.find((city) => String(city.code) === String(cityCode));

    setFormData((prev) => ({
      ...prev,
      ciudadEntregaCodigo: cityCode,
      ciudadEntregaNombre: selectedCity?.name || '',
      ciudad: selectedCity?.name || '',
    }));
    setTouched((prev) => ({ ...prev, ciudadEntregaCodigo: true }));
    setErrors((prev) => ({
      ...prev,
      ciudadEntregaCodigo: validateCiudadEntrega(cityCode),
      ciudad: '',
    }));
  };

  const handleDeliveryMethodChange = (method) => {
    setDeliveryMethod(method);

    if (method === 'domicilio') {
      setShowPaymentModal(false);
    }

    if (method === 'tienda') {
      setCiudades([]);
      setFormData((prev) => ({
        ...prev,
        departamentoEntregaCodigo: '',
        departamentoEntregaNombre: '',
        ciudadEntregaCodigo: '',
        ciudadEntregaNombre: '',
        ciudad: '',
        barrio: '',
        direccion: '',
      }));
      setErrors((prev) => ({
        ...prev,
        departamentoEntregaCodigo: '',
        ciudadEntregaCodigo: '',
        ciudad: '',
        barrio: '',
        direccion: '',
      }));
      setTouched((prev) => ({
        ...prev,
        departamentoEntregaCodigo: false,
        ciudadEntregaCodigo: false,
        ciudad: false,
        barrio: false,
        direccion: false,
      }));
    }
  };

  const handlePickupCheckout = () => {
    setShowPaymentModal(true);
  };

  const handleDeliveryCheckout = async () => {
    const payload = buildCheckoutOrderPayload();
    const productWithoutBarcode = payload.productos.some((product) => !product.codBarras);

    if (productWithoutBarcode) {
      showError(
        'Producto sin código de barras',
        'Uno de los productos no tiene código de barras y no puede agregarse al pedido.'
      );
      return;
    }

    setIsDeliverySubmitting(true);

    try {
      const createdOrder = await OrdersService.create(payload);
      const createdOrderId = createdOrder?.id ?? createdOrder?.pedidoId ?? createdOrder?.orderId;

      if (!createdOrderId) {
        throw new Error('El pedido fue creado, pero no se recibió el identificador para consultarlo.');
      }

      await clearCart();
      showSuccess(
        'Pedido enviado',
        'Tu pedido quedó pendiente de asignación del valor de envío. Un asesor lo revisará y te indicará el total a pagar.'
      );
      navigate(`/orders-l/${createdOrderId}`);
    } catch (error) {
      console.error('Error creando pedido a domicilio:', error);
      showError(
        'No se pudo crear el pedido',
        error?.response?.data?.message || error?.message || 'Intenta nuevamente en unos minutos.'
      );
    } finally {
      setIsDeliverySubmitting(false);
    }
  };

  const getIncompleteProfileFields = () => {
    const fields = [];

    if (validateNombreCompleto(preloadedCustomerData.nombreCompleto)) {
      fields.push('nombre');
    }
    if (validateCorreo(preloadedCustomerData.correo)) {
      fields.push('correo');
    }
    if (validateTelefono(preloadedCustomerData.telefono)) {
      fields.push('teléfono');
    }

    return fields;
  };

  const handleRemoveItem = async (item) => {
    const result = await showConfirm(
      'warning',
      '¿Eliminar producto?',
      `¿Estás seguro de eliminar "${item.name}" del carrito?`
    );
    if (result.isConfirmed) removeFromCart(item.id);
  };

  const handleClearCart = async () => {
    const result = await showConfirm(
      'warning',
      '¿Vaciar carrito?',
      '¿Estás seguro de eliminar todos los productos del carrito?'
    );
    if (result.isConfirmed) clearCart();
  };

  const handleProcederPago = async () => {
    if (!isAuthenticated) {
      showError('Inicia sesión', 'Debes iniciar sesión para crear y consultar tu pedido.');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (clientLoading) {
      showError('Consultando cliente', 'Espera un momento mientras cargamos tu perfil de cliente.');
      return;
    }

    if (!clientId) {
      setShowClientModal(true);
      return;
    }

    const incompleteProfileFields = getIncompleteProfileFields();
    if (incompleteProfileFields.length > 0) {
      setErrors((prev) => ({
        ...prev,
        nombreCompleto: validateNombreCompleto(preloadedCustomerData.nombreCompleto),
        correo: validateCorreo(preloadedCustomerData.correo),
        telefono: validateTelefono(preloadedCustomerData.telefono),
      }));
      setTouched((prev) => ({
        ...prev,
        nombreCompleto: true,
        correo: true,
        telefono: true,
      }));

      const result = await showConfirm(
        'warning',
        'Perfil incompleto',
        `Para finalizar la compra debes completar tu ${incompleteProfileFields.join(', ')} en el perfil.`,
        {
          confirmButtonText: 'Editar perfil',
          cancelButtonText: 'Volver al carrito',
        }
      );

      if (result?.isConfirmed) {
        navigate('/perfil/editar', { state: { from: '/cart' } });
      }
      return;
    }

    if (!validateForm()) {
      showError('Formulario incompleto', 'Por favor completa todos los campos correctamente.');
      return;
    }

    if (deliveryMethod === 'domicilio') {
      await handleDeliveryCheckout();
      return;
    }

    handlePickupCheckout();
  };

  const displayCartItems = useMemo(
    () =>
      cartItems.map(item => {
        const pricing = getDisplayPricing(item, clientType);
        return {
          ...item,
          price: pricing.price,
          originalPrice: pricing.originalPrice,
          priceLabel: pricing.label,
          clientType: pricing.clientType,
        };
      }),
    [cartItems, clientType]
  );

  const checkoutDeliveryInfo = useMemo(
    () => ({
      ...formData,
      ...preloadedCustomerData,
      deliveryRecipientName: formData.deliveryRecipientName,
      deliveryRecipientPhone: formData.deliveryRecipientPhone,
      ciudad: formData.ciudad,
      direccion: formData.direccion,
      notas: formData.notas,
    }),
    [formData, preloadedCustomerData]
  );

  const buildCheckoutOrderPayload = () => {
    const isPickup = deliveryMethod === 'tienda';

    return {
      clienteId: clientId,
      tipoEntrega: isPickup ? 'recoge' : 'domicilio',
      direccionEntrega: isPickup ? 'El cliente lo recoge' : buildDeliveryAddress(checkoutDeliveryInfo),
      deliveryRecipientName: isPickup
        ? null
        : String(checkoutDeliveryInfo?.deliveryRecipientName || '').trim(),
      deliveryRecipientPhone: isPickup
        ? null
        : String(checkoutDeliveryInfo?.deliveryRecipientPhone || '').trim(),
      departamentoEntregaCodigo: isPickup ? null : checkoutDeliveryInfo?.departamentoEntregaCodigo,
      departamentoEntregaNombre: isPickup ? null : checkoutDeliveryInfo?.departamentoEntregaNombre,
      ciudadEntregaCodigo: isPickup ? null : checkoutDeliveryInfo?.ciudadEntregaCodigo,
      ciudadEntregaNombre: isPickup ? null : checkoutDeliveryInfo?.ciudadEntregaNombre,
      productos: buildCheckoutProducts(displayCartItems),
      estadoLogistico: ESTADOS_LOGISTICOS.EN_PROCESO,
      origen: ORIGENES.WEB,
      saleType: ORIGENES.WEB,
    };
  };

  const subtotal = displayCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const departamentoOptions = departamentos.map((department) => ({
    value: department.code,
    label: department.name,
  }));
  const ciudadOptions = ciudades.map((city) => ({
    value: city.code,
    label: city.name,
  }));

  const handleUseSessionNameForRecipient = () => {
    const sessionName = String(preloadedCustomerData.nombreCompleto || '').trim();
    if (!sessionName) return;

    setFormData((prev) => ({ ...prev, deliveryRecipientName: sessionName }));
    setTouched((prev) => ({ ...prev, deliveryRecipientName: true }));
    setErrors((prev) => ({
      ...prev,
      deliveryRecipientName: validateDeliveryRecipientName(sessionName),
    }));
  };

  const renderDeliveryRecipientField = () => (
    <div className="form-group">
      <div className="recipient-label-row">
        <label className="form-label">
          <UserRound size={12} /> Persona que recibe/recoge <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          className="btn-recipient-helper"
          onClick={handleUseSessionNameForRecipient}
          disabled={!preloadedCustomerData.nombreCompleto}
          title="Usar el nombre del cliente en sesión"
        >
          <UserRound size={12} /> Usar cliente
        </button>
      </div>
      <input
        type="text"
        name="deliveryRecipientName"
        value={formData.deliveryRecipientName}
        onChange={handleInputChange}
        onBlur={() => handleBlur('deliveryRecipientName')}
        placeholder="Nombre completo de quien recibe o recoge"
        maxLength={255}
        className={`form-input ${
          errors.deliveryRecipientName && touched.deliveryRecipientName
            ? 'error'
            : formData.deliveryRecipientName && !errors.deliveryRecipientName && touched.deliveryRecipientName
            ? 'success'
            : ''
        }`}
      />
      {errors.deliveryRecipientName && touched.deliveryRecipientName && (
        <div className="error-message">
          <AlertCircle size={11} /> {errors.deliveryRecipientName}
        </div>
      )}

      <label className="form-label mt-3">
        <Phone size={12} /> Telefono de quien recibe <span className="text-red-500">*</span>
      </label>
      <input
        type="tel"
        name="deliveryRecipientPhone"
        value={formData.deliveryRecipientPhone}
        onChange={handleInputChange}
        onBlur={() => handleBlur('deliveryRecipientPhone')}
        placeholder="Ej: 3001234567"
        maxLength={10}
        className={`form-input ${
          errors.deliveryRecipientPhone && touched.deliveryRecipientPhone
            ? 'error'
            : formData.deliveryRecipientPhone && !errors.deliveryRecipientPhone && touched.deliveryRecipientPhone
            ? 'success'
            : ''
        }`}
      />
      {errors.deliveryRecipientPhone && touched.deliveryRecipientPhone && (
        <div className="error-message">
          <AlertCircle size={11} /> {errors.deliveryRecipientPhone}
        </div>
      )}

    </div>
  );

  if (cartLoading) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <CartIcon size={26} color="#004D77" strokeWidth={1.5} />
            </div>
            <h3 className="cart-empty-title">Cargando carrito...</h3>
            <p className="cart-empty-sub">
              Estamos sincronizando tus productos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <CartIcon size={26} color="#004D77" strokeWidth={1.5} />
            </div>
            <h3 className="cart-empty-title">Tu carrito está vacío</h3>
            <p className="cart-empty-sub">
              Agrega los productos que deseas y continúa tu compra de forma fácil y rápida.
            </p>
            <button onClick={() => navigate('/shop')} className="btn-outline">
              Ir a la tienda <ArrowRight size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <div className="cart-icon-circle">
            <CartIcon size={22} color="#004D77" strokeWidth={1.8} />
          </div>
          <h1 className="cart-title">Carrito de compras</h1>
        </div>

        <div className="cart-action-buttons">
          <button onClick={handleClearCart} className="btn-secondary">
            Vaciar carrito
          </button>
          <button onClick={() => navigate('/shop')} className="btn-primary">
            Seguir comprando
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-2.5">
            {displayCartItems.map((item, idx) => (
              <div
                key={`${item.id}-${item.idBarcode || item.barcode || item.presentation || idx}`}
                className="cart-item-card"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="cart-item-inner">
                  <div
                    className="cart-item-img"
                    onClick={() => navigate(`/shop/detail/${item.id}`)}
                  >
                    <img
                      src={item.image || item.mainImage?.url || item.images?.[0]?.url}
                      alt={item.name}
                    />
                  </div>
                  <div className="cart-item-info">
                    <div
                      className="cart-item-name"
                      onClick={() => navigate(`/shop/detail/${item.id}`)}
                    >
                      {item.name}
                    </div>
                    <div className="cart-item-category">
                      {item.category || item.mainCategory?.name || item.categories?.[0]?.name || 'Sin categoría'}
                    </div>
                    <div className="cart-item-price">
                      ${item.price.toLocaleString()} COP
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button
                        className="qty-btn"
                        onClick={() => decreaseQuantity(item.id)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={Number(item.totalStock ?? item.stock) || undefined}
                        value={item.quantity}
                        aria-label={`Cantidad de ${item.name}`}
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) => updateQuantity(item.id, event.target.value)}
                        className="qty-number w-12 bg-transparent text-center outline-none"
                      />
                      <button
                        className="qty-btn"
                        onClick={() => increaseQuantity(item.id)}
                        disabled={
                          Number(item.totalStock ?? item.stock) > 0 &&
                          item.quantity >= Number(item.totalStock ?? item.stock)
                        }
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="item-total">
                      ${(item.price * item.quantity).toLocaleString()} COP
                    </div>
                    <button className="delete-btn" onClick={() => handleRemoveItem(item)}>
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            {deliveryMethod === 'domicilio' ? (
              <div className="delivery-form-card">
                <div className="form-title">
                  <MapPin size={18} color="#004D77" /> Información de envío
                </div>

                <div className="delivery-method-grid">
                  <div
                    className={`method-option ${deliveryMethod === 'domicilio' ? 'active' : ''}`}
                    onClick={() => handleDeliveryMethodChange('domicilio')}
                  >
                    <MapPin className="method-icon" />
                    <span className="method-label">Domicilio</span>
                  </div>
                  <div
                    className={`method-option ${deliveryMethod === 'tienda' ? 'active' : ''}`}
                    onClick={() => handleDeliveryMethodChange('tienda')}
                  >
                    <Store className="method-icon" />
                    <span className="method-label">Recoger en tienda</span>
                  </div>
                </div>

                {deliveryMethod === 'domicilio' && renderDeliveryRecipientField()}

                {[
                  { name: 'correo', label: 'Correo electrónico', icon: Mail, type: 'email', placeholder: 'ejemplo@correo.com' },
                ].map((field) => (
                  <div className="form-group" key={field.name}>
                    <label className="form-label">
                      <field.icon size={12} /> {field.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={preloadedCustomerData[field.name]}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur(field.name)}
                      placeholder={field.placeholder}
                      disabled
                      className={`form-input ${
                        errors[field.name] && touched[field.name]
                          ? 'error'
                          : formData[field.name] && !errors[field.name] && touched[field.name]
                          ? 'success'
                          : ''
                      }`}
                    />
                    {errors[field.name] && touched[field.name] && (
                      <div className="error-message">
                        <AlertCircle size={11} /> {errors[field.name]}
                      </div>
                    )}
                  </div>
                ))}

                <div className="profile-edit-row">
                  <button
                    type="button"
                    className="btn-profile-edit"
                    onClick={() => navigate('/perfil/editar')}
                  >
                    <SquarePen size={13} /> Editar perfil
                  </button>
                </div>

                <div className="mt-3 border-t border-[#e2edf5] pt-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-[#004D77]">
                    <MapPin size={15} />
                    Datos de envío
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">
                      <MapPin size={12} /> Departamento <span className="text-red-500">*</span>
                    </label>
                    <FormSelect
                      value={formData.departamentoEntregaCodigo}
                      options={departamentoOptions}
                      onChange={handleDepartamentoEntregaChange}
                      disabled={loadingDepartamentos}
                      error={errors.departamentoEntregaCodigo && touched.departamentoEntregaCodigo}
                      placeholder={loadingDepartamentos ? 'Cargando departamentos...' : 'Seleccione departamento'}
                      searchable
                      searchPlaceholder="Buscar departamento..."
                      noOptionsMessage="No se encontraron departamentos"
                      ariaLabel="Departamento de entrega"
                      className="rounded-[11px] border-[#e2edf5] py-2 text-xs"
                    />
                    {errors.departamentoEntregaCodigo && touched.departamentoEntregaCodigo && (
                      <div className="error-message">
                        <AlertCircle size={11} /> {errors.departamentoEntregaCodigo}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <MapPin size={12} /> Municipio/Ciudad <span className="text-red-500">*</span>
                    </label>
                    <FormSelect
                      value={formData.ciudadEntregaCodigo}
                      options={ciudadOptions}
                      onChange={handleCiudadEntregaChange}
                      disabled={loadingCiudades || !formData.departamentoEntregaCodigo}
                      error={errors.ciudadEntregaCodigo && touched.ciudadEntregaCodigo}
                      placeholder={loadingCiudades ? 'Cargando municipios...' : 'Seleccione municipio/ciudad'}
                      searchable
                      searchPlaceholder="Buscar municipio/ciudad..."
                      noOptionsMessage="No se encontraron municipios/ciudades"
                      ariaLabel="Municipio o ciudad de entrega"
                      className="rounded-[11px] border-[#e2edf5] py-2 text-xs"
                    />
                    {errors.ciudadEntregaCodigo && touched.ciudadEntregaCodigo && (
                      <div className="error-message">
                        <AlertCircle size={11} /> {errors.ciudadEntregaCodigo}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={12} /> Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('direccion')}
                    placeholder="Calle 123 # 45-67, Apto 101"
                    className={`form-input ${
                      errors.direccion && touched.direccion ? 'error' : formData.direccion && !errors.direccion && touched.direccion ? 'success' : ''
                    }`}
                  />
                  {errors.direccion && touched.direccion && <div className="error-message"><AlertCircle size={11} /> {errors.direccion}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <MessageSquare size={12} /> Notas adicionales (opcional)
                  </label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    rows="2"
                    className="form-input"
                    placeholder="Barrio, apartamento, torre, referencias o instrucciones para la entrega..."
                  />
                </div>

                <div className="summary-card" style={{ marginTop: 18 }}>
                  <div className="summary-title">Resumen del pedido</div>
                  <div className="price-row">
                    <span>Subtotal</span>
                    <span className="font-bold">${subtotal.toLocaleString()} COP</span>
                  </div>
                  <div className="price-row">
                    <span>Envío</span>
                    <span className="shipping-pending-value">Pendiente por asesor</span>
                  </div>
                  <div className="price-row total-row">
                    <span>Total productos</span>
                    <span className="text-[#004D77] text-lg">${subtotal.toLocaleString()} COP</span>
                  </div>
                  <div className="shipping-pending-note">
                    <AlertCircle size={15} />
                    <span>
                      Al enviar tu pedido, un asesor asignará el valor del envío y te indicará el total final a pagar.
                    </span>
                  </div>
              <button
                className="btn-checkout"
                onClick={handleProcederPago}
                disabled={isDeliverySubmitting}
              >
                {isDeliverySubmitting ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" /> Enviando pedido...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} /> Enviar pedido
                  </>
                )}
              </button>
                </div>
              </div>
            ) : (
              <div className="summary-card">
                <div className="summary-title">
                  <Store size={18} color="#004D77" /> Resumen del pedido
                </div>

                <div className="delivery-method-grid">
                  <div
                    className={`method-option ${deliveryMethod === 'domicilio' ? 'active' : ''}`}
                    onClick={() => handleDeliveryMethodChange('domicilio')}
                  >
                    <MapPin className="method-icon" />
                    <span className="method-label">Domicilio</span>
                  </div>
                  <div
                    className={`method-option ${deliveryMethod === 'tienda' ? 'active' : ''}`}
                    onClick={() => handleDeliveryMethodChange('tienda')}
                  >
                    <Store className="method-icon" />
                    <span className="method-label">Recoger en tienda</span>
                  </div>
                </div>

                {deliveryMethod === 'domicilio' && renderDeliveryRecipientField()}

                <div className="pickup-store-info">
                  <div className="pickup-store-icon" aria-hidden="true">
                    <MapPin size={18} />
                  </div>
                  <div className="pickup-store-content">
                    <p className="pickup-store-title">Punto de recogida</p>
                    <p className="pickup-store-line">
                      <strong>{PICKUP_STORE_LOCATION.name}</strong>
                    </p>
                    <p className="pickup-store-line">{PICKUP_STORE_LOCATION.address}</p>
                    <p className="pickup-store-line">{PICKUP_STORE_LOCATION.place}</p>
                    <p className="pickup-store-line">{PICKUP_STORE_LOCATION.details}</p>
                    <p className="pickup-store-line">{PICKUP_STORE_LOCATION.city}</p>
                    <a
                      className="pickup-store-map"
                      href={PICKUP_STORE_LOCATION.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver ubicación <ArrowRight size={14} />
                    </a>
                  </div>
                </div>

                <div className="price-row">
                  <span>Subtotal</span>
                  <span className="font-bold">${subtotal.toLocaleString()} COP</span>
                </div>
                <div className="price-row">
                  <span>Envío</span>
                  <span>N/A</span>
                </div>
                <div className="price-row total-row">
                  <span>Total</span>
                  <span className="text-[#004D77] text-lg">${subtotal.toLocaleString()} COP</span>
                </div>
                <button className="btn-checkout" onClick={handleProcederPago}>
                  <CreditCard size={16} /> Finalizar compra
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPaymentModal && deliveryMethod === 'tienda' && (
        <CompletePay
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onCompleted={async (order) => {
            await clearCart();
            setFavorBalance((current) =>
              Math.max(0, current - Number(order?.favorBalanceAmountUsed || order?.favorBalanceUsed || 0))
            );
            setShowPaymentModal(false);
            navigate(`/orders-l/${order.id}`);
          }}
          totalAmount={subtotal}
          deliveryInfo={checkoutDeliveryInfo}
          cartItems={displayCartItems}
          clientId={clientId}
          favorBalance={favorBalance}
        />
      )}

      <CompleteClientProfile
        isOpen={
          showClientModal
          && isAuthenticated
          && !clientLoading
          && !clientId
        }
        user={user}
        onClose={() => setShowClientModal(false)}
        onCreated={(createdClient) => {
          setClient(createdClient);
          const session = getSession();
          if (session) saveSession({ ...session, client: createdClient });
          setShowClientModal(false);
          setResumeCheckout(true);
        }}
      />
    </div>
  );
}

export default ShoppingCart;
