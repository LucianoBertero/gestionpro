import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

export interface AfipData {
    cuit: string;
    denominacion: string;
    domicilio: string;
    condicionIva: string;
    actividades: string[];
}

const CUIT_REGEX = /^\d{2}-\d{8}-\d{1}$/;

const MOCK_DATA: Record<string, AfipData> = {
    '30-12345678-9': {
        cuit: '30-12345678-9',
        denominacion: 'Empresa Ejemplo S.A.',
        domicilio: 'Av. Corrientes 1234, CABA',
        condicionIva: 'Responsable Inscripto',
        actividades: ['Venta al por mayor de productos textiles'],
    },
    '30-55556666-7': {
        cuit: '30-55556666-7',
        denominacion: 'Tech Solutions S.R.L.',
        domicilio: 'Av. del Libertador 4567, CABA',
        condicionIva: 'Responsable Inscripto',
        actividades: [
            'Servicios de consultoría en informática',
            'Desarrollo de software',
        ],
    },
    '20-98765432-1': {
        cuit: '20-98765432-1',
        denominacion: 'Juan Pérez',
        domicilio: 'Calle Falsa 742, Rosario',
        condicionIva: 'Monotributista',
        actividades: ['Servicios profesionales'],
    },
    '56-56565656-5': {
        cuit: '56-56565656-5',
        denominacion: 'Estudio Contable Demo S.R.L.',
        domicilio: 'Av. 9 de Julio 5000, CABA',
        condicionIva: 'Responsable Inscripto',
        actividades: ['Asesoramiento contable', 'Gestión impositiva'],
    },
    '33-12345678-9': {
        cuit: '33-12345678-9',
        denominacion: 'Servicios Profesionales García',
        domicilio: 'Calle Rivadavia 2500, La Plata',
        condicionIva: 'Responsable Inscripto',
        actividades: ['Consultoría empresarial'],
    },
    '27-34567890-2': {
        cuit: '27-34567890-2',
        denominacion: 'María González López',
        domicilio: 'Belgrano 1000, Mendoza',
        condicionIva: 'Monotributista',
        actividades: ['Servicios contables independientes'],
    },
};

@Injectable()
export class AfipService {
    private readonly logger = new Logger(AfipService.name);

    getAfipData(cuit: string): AfipData {
        if (!CUIT_REGEX.test(cuit)) {
            throw new HttpException(
                'clientes.error.cuitInvalido',
                HttpStatus.BAD_REQUEST
            );
        }

        const data = MOCK_DATA[cuit];
        if (!data) {
            throw new HttpException(
                'clientes.error.afipNoData',
                HttpStatus.NOT_FOUND
            );
        }

        this.logger.log(`AFIP mock: datos encontrados para CUIT ${cuit}`);
        return data;
    }
}
