import { HospitalsService } from './hospitals.service';
import { CreateHospitalDto, UpdateHospitalDto, FilterHospitalDto } from './dto/hospitals.dto';
export declare class HospitalsController {
    private readonly hospitalsService;
    constructor(hospitalsService: HospitalsService);
    create(createHospitalDto: CreateHospitalDto): Promise<{
        specialties: {
            id: string;
            name: string;
            slug: string;
        }[];
        keywords: {
            id: string;
            term: string;
        }[];
    } & {
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        district: string;
        emergencyAvailable: boolean;
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
        slug: string;
        rating: number;
        description: string | null;
        address: string;
        hospitalType: string;
        ambulanceAvailable: boolean;
        website: string | null;
        images: string[];
    }>;
    findAll(filterDto: FilterHospitalDto): Promise<{
        hospitals: ({
            specialties: {
                id: string;
                name: string;
                slug: string;
            }[];
        } & {
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            district: string;
            emergencyAvailable: boolean;
            verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
            slug: string;
            rating: number;
            description: string | null;
            address: string;
            hospitalType: string;
            ambulanceAvailable: boolean;
            website: string | null;
            images: string[];
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(slug: string): Promise<{
        specialties: {
            id: string;
            name: string;
            slug: string;
        }[];
        keywords: {
            id: string;
            term: string;
        }[];
    } & {
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        district: string;
        emergencyAvailable: boolean;
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
        slug: string;
        rating: number;
        description: string | null;
        address: string;
        hospitalType: string;
        ambulanceAvailable: boolean;
        website: string | null;
        images: string[];
    }>;
    update(id: string, updateHospitalDto: UpdateHospitalDto): Promise<{
        specialties: {
            id: string;
            name: string;
            slug: string;
        }[];
        keywords: {
            id: string;
            term: string;
        }[];
    } & {
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        district: string;
        emergencyAvailable: boolean;
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
        slug: string;
        rating: number;
        description: string | null;
        address: string;
        hospitalType: string;
        ambulanceAvailable: boolean;
        website: string | null;
        images: string[];
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
