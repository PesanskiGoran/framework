import {Router} from "express";
import {ComponentUtil} from "../decorators/ComponentDecorator";
import {Interceptor} from "../interceptors/InterceptorDecorator";
import {Request, Response} from "express-serve-static-core";
import {NextFunction} from "express-serve-static-core";
import {RequestMappingUtil} from "../decorators/RequestMappingDecorator";

export class Dispatcher {

    private router: Router;

    constructor() {
        this.router = Router();
    }

    getRouter () {
        return this.router;
    }

    processAfterInit(clazz, instance) {
        if (ComponentUtil.isInterceptor(clazz)) {
            this.registerInterceptor(instance);
        }
        if (ComponentUtil.isController(clazz)) {
            this.registerController(clazz, instance);
        }
    }

    private registerController (clazz, instance) {
        let routerConfig = RequestMappingUtil.getRouterConfig(clazz);
        for (let route of routerConfig.routes) {
            //console.log('Registering route: ', route);
            this.router[route.requestConfig.method](route.requestConfig.path, (request, response) => {
                instance[route.methodHandler](request, response).then(function (result) {
                    response.json(result);
                });
            });
        }
    }

    private registerInterceptor(interceptor: Interceptor) {
        this.router.use((request:Request, response: Response, next: NextFunction) => {
            interceptor.preHandle(request, response)
                .then(next).catch((error) => console.log(error));
        });
    }
}