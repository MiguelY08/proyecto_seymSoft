import { useState, useCallback } from "react";

import {
  getCustomerInvoices,
  getInvoiceInstallments,
} from "../services/paymentsServices.js";

import {
  mapInvoices,
  mapInstallments,
} from "../mappers/paymentsMapper";

export default function usePaymentsDetails() {
  const [invoices, setInvoices] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  /**
   * ==========================================
   * CARGAR FACTURAS + ABONOS
   * ==========================================
   */
  const loadInvoices =
    useCallback(
      async (idCustomer) => {
        try {
          setLoading(true);
          setError(null);

          const invoicesResponse =
            await getCustomerInvoices(
              idCustomer
            );


          const mappedInvoices =
            mapInvoices(
              invoicesResponse
            );

          const invoicesWithInstallments =
            await Promise.all(
              mappedInvoices.map(
                async (
                  invoice
                ) => {
                  try {
                    const installmentsResponse =
                      await getInvoiceInstallments(
                        invoice.idSale
                      );

                    return {
                      ...invoice,

                      abonos:
                        mapInstallments(
                          installmentsResponse
                        ),
                    };
                  } catch (
                    installmentError
                  ) {
                    console.error(
                      installmentError
                    );

                    return {
                      ...invoice,
                      abonos: [],
                    };
                  }
                }
              )
            );

          setInvoices(
            invoicesWithInstallments
          );

          return (
            invoicesWithInstallments
          );
        } catch (err) {
          console.error(err);

          setError(err);

          setInvoices([]);

          return [];
        } finally {
          setLoading(false);
        }
      },
      []
    );

  /**
   * ==========================================
   * REFRESH
   * ==========================================
   */
  const refreshInvoices =
    async (idCustomer) => {
      return loadInvoices(
        idCustomer
      );
    };

  return {
    invoices,

    loading,

    error,

    setInvoices,

    loadInvoices,

    refreshInvoices,
  };
}