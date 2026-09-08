export const ORDER_FONT_FAMILY = "'Nunito', 'Segoe UI', sans-serif";

let orderTypographyInjected = false;

export function injectOrderTypography() {
  if (orderTypographyInjected) return;

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
  `;
  document.head.appendChild(style);
  orderTypographyInjected = true;
}

