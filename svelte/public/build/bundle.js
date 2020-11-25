
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35731/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function sineInOut(t) {
        return -0.5 * (Math.cos(Math.PI * t) - 1);
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const cur_blueline = writable([]);
    const cur_treble = writable([]);
    const stage = writable(8);
    const cur_bell = writable(8);
    const cur_method = writable('');
    const card_complete = writable(false);
    const lead_length = writable(0);

    const cards_today = writable([]);

    const mistakes = writable(0);

    function bellName(b) {
        switch (b){
            case 10:
                return '0';
            case 11:
                return 'E';
            case 12:
                return 'T';
            case 13:
                return 'A';
            case 14:
                return 'B';
            case 15:
                return 'C';
            case 16:
                return 'D';
            default:
                return b;
        }
    }

    function detectMob() {
        const toMatch = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];

        return toMatch.some((toMatchItem) => {
            return navigator.userAgent.match(toMatchItem);
        });
    }

    /* src/Card.svelte generated by Svelte v3.29.4 */

    const { console: console_1 } = globals;
    const file = "src/Card.svelte";

    // (50:4) {:else}
    function create_else_block_1(ctx) {
    	let h3;

    	function select_block_type_2(ctx, dirty) {
    		if (/*method*/ ctx[0]) return create_if_block_2;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			if_block.c();
    			attr_dev(h3, "class", "card-title mt-3 mb-3");
    			add_location(h3, file, 50, 6, 957);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			if_block.m(h3, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(h3, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(50:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (42:4) {#if small}
    function create_if_block(ctx) {
    	let h6;

    	function select_block_type_1(ctx, dirty) {
    		if (/*method*/ ctx[0]) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			h6 = element("h6");
    			if_block.c();
    			attr_dev(h6, "class", "card-title mt-3 mb-3");
    			add_location(h6, file, 42, 6, 788);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h6, anchor);
    			if_block.m(h6, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(h6, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h6);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(42:4) {#if small}",
    		ctx
    	});

    	return block;
    }

    // (54:8) {:else}
    function create_else_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Done for the day!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(54:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (52:8) {#if method}
    function create_if_block_2(ctx) {
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text(/*method*/ ctx[0]);
    			t1 = space();
    			t2 = text(/*bell*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*method*/ 1) set_data_dev(t0, /*method*/ ctx[0]);
    			if (dirty & /*bell*/ 2) set_data_dev(t2, /*bell*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(52:8) {#if method}",
    		ctx
    	});

    	return block;
    }

    // (46:8) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Done for the day!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(46:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (44:8) {#if method}
    function create_if_block_1(ctx) {
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text(/*method*/ ctx[0]);
    			t1 = space();
    			t2 = text(/*bell*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*method*/ 1) set_data_dev(t0, /*method*/ ctx[0]);
    			if (dirty & /*bell*/ 2) set_data_dev(t2, /*bell*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(44:8) {#if method}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div1;
    	let div0;

    	function select_block_type(ctx, dirty) {
    		if (/*small*/ ctx[3]) return create_if_block;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			attr_dev(div0, "class", "card-body py-0 text-center");
    			add_location(div0, file, 40, 2, 725);
    			attr_dev(div1, "class", "card mx-auto mb-2");
    			set_style(div1, "width", /*width*/ ctx[2]);

    			set_style(div1, "border-color", /*$card_complete*/ ctx[5]
    			? "var(--" + /*done_color*/ ctx[4] + ")"
    			: "rgba(0,0,0,0.125)");

    			set_style(div1, "border-width", /*$card_complete*/ ctx[5] ? "3px" : "1px");
    			add_location(div1, file, 36, 0, 527);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_block.m(div0, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			if (dirty & /*width*/ 4) {
    				set_style(div1, "width", /*width*/ ctx[2]);
    			}

    			if (dirty & /*$card_complete, done_color*/ 48) {
    				set_style(div1, "border-color", /*$card_complete*/ ctx[5]
    				? "var(--" + /*done_color*/ ctx[4] + ")"
    				: "rgba(0,0,0,0.125)");
    			}

    			if (dirty & /*$card_complete*/ 32) {
    				set_style(div1, "border-width", /*$card_complete*/ ctx[5] ? "3px" : "1px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $mistakes;
    	let $card_complete;
    	validate_store(mistakes, "mistakes");
    	component_subscribe($$self, mistakes, $$value => $$invalidate(6, $mistakes = $$value));
    	validate_store(card_complete, "card_complete");
    	component_subscribe($$self, card_complete, $$value => $$invalidate(5, $card_complete = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, []);
    	let { method } = $$props;
    	let { bell } = $$props;
    	let { width } = $$props;
    	let { small = true } = $$props;
    	let done_color;
    	const writable_props = ["method", "bell", "width", "small"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("method" in $$props) $$invalidate(0, method = $$props.method);
    		if ("bell" in $$props) $$invalidate(1, bell = $$props.bell);
    		if ("width" in $$props) $$invalidate(2, width = $$props.width);
    		if ("small" in $$props) $$invalidate(3, small = $$props.small);
    	};

    	$$self.$capture_state = () => ({
    		mistakes,
    		card_complete,
    		method,
    		bell,
    		width,
    		small,
    		done_color,
    		$mistakes,
    		$card_complete
    	});

    	$$self.$inject_state = $$props => {
    		if ("method" in $$props) $$invalidate(0, method = $$props.method);
    		if ("bell" in $$props) $$invalidate(1, bell = $$props.bell);
    		if ("width" in $$props) $$invalidate(2, width = $$props.width);
    		if ("small" in $$props) $$invalidate(3, small = $$props.small);
    		if ("done_color" in $$props) $$invalidate(4, done_color = $$props.done_color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$mistakes*/ 64) {
    			 switch ($mistakes) {
    				case 0:
    					$$invalidate(4, done_color = "success");
    					break;
    				case 1:
    				case 2:
    					$$invalidate(4, done_color = "primary");
    					break;
    				case 3:
    				case 4:
    					$$invalidate(4, done_color = "warning");
    					break;
    				default:
    					$$invalidate(4, done_color = "danger");
    					break;
    			}
    		}

    		if ($$self.$$.dirty & /*$card_complete, done_color*/ 48) {
    			 console.log($card_complete, done_color);
    		}
    	};

    	return [method, bell, width, small, done_color, $card_complete];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { method: 0, bell: 1, width: 2, small: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*method*/ ctx[0] === undefined && !("method" in props)) {
    			console_1.warn("<Card> was created without expected prop 'method'");
    		}

    		if (/*bell*/ ctx[1] === undefined && !("bell" in props)) {
    			console_1.warn("<Card> was created without expected prop 'bell'");
    		}

    		if (/*width*/ ctx[2] === undefined && !("width" in props)) {
    			console_1.warn("<Card> was created without expected prop 'width'");
    		}
    	}

    	get method() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set method(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bell() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bell(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TouchHandler.svelte generated by Svelte v3.29.4 */

    function create_fragment$1(ctx) {
    	let mounted;
    	let dispose;

    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (!mounted) {
    				dispose = listen_dev(window, "touchstart", prevent_default(/*touchstart_handler*/ ctx[2]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $card_complete;
    	validate_store(card_complete, "card_complete");
    	component_subscribe($$self, card_complete, $$value => $$invalidate(3, $card_complete = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TouchHandler", slots, []);
    	let dispatch = createEventDispatcher();
    	let { width } = $$props;

    	function handleTouch(e) {
    		if (e.layerY < 200) {
    			return;
    		}

    		if (e.touches.length > 1) {
    			return;
    		}

    		if ($card_complete) {
    			dispatch("done");
    		}

    		if (e.layerX < width / 3 - 20) {
    			dispatch("touch", { dir: -1 });
    		} else if (e.layerX < 2 * width / 3 + 20) {
    			dispatch("touch", { dir: 0 });
    		} else {
    			dispatch("touch", { dir: 1 });
    		}
    	}

    	const writable_props = ["width"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TouchHandler> was created with unknown prop '${key}'`);
    	});

    	const touchstart_handler = e => handleTouch(e);

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		card_complete,
    		dispatch,
    		width,
    		handleTouch,
    		$card_complete
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [handleTouch, width, touchstart_handler];
    }

    class TouchHandler extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { width: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TouchHandler",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[1] === undefined && !("width" in props)) {
    			console.warn("<TouchHandler> was created without expected prop 'width'");
    		}
    	}

    	get width() {
    		throw new Error("<TouchHandler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<TouchHandler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/MethodDisplay.svelte generated by Svelte v3.29.4 */
    const file$1 = "src/MethodDisplay.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	child_ctx[46] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	child_ctx[46] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	child_ctx[46] = i;
    	return child_ctx;
    }

    // (5:0) {#if innerWidth}
    function create_if_block_1$1(ctx) {
    	let card;
    	let t;
    	let svg;
    	let each0_anchor;
    	let each1_anchor;
    	let if_block0_anchor;
    	let if_block1_anchor;
    	let if_block2_anchor;
    	let svg_viewBox_value;
    	let current;

    	card = new Card({
    			props: {
    				method: /*method*/ ctx[0],
    				bell: /*place_bell*/ ctx[3],
    				width: /*canvas_width*/ ctx[12],
    				small: /*cardtext_small*/ ctx[10]
    			},
    			$$inline: true
    		});

    	let each_value_2 = Array(/*stage*/ ctx[1] - 1);
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = Array(/*stage*/ ctx[1]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block0 = /*mistake*/ ctx[6] && create_if_block_5(ctx);
    	let if_block1 = /*blueline*/ ctx[4].length != 0 && create_if_block_4(ctx);
    	let if_block2 = /*treble_path*/ ctx[2].length != 0 && create_if_block_3(ctx);
    	let if_block3 = /*$card_complete*/ ctx[14] && mistakes > 0 && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    			t = space();
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			each0_anchor = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each1_anchor = empty();
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			if (if_block3) if_block3.c();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg, "width", /*canvas_width*/ ctx[12]);
    			set_style(svg, "height", /*canvas_height*/ ctx[13]);
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*canvas_width*/ ctx[12] + " " + /*canvas_height*/ ctx[13]);
    			attr_dev(svg, "class", "svelte-1cxsslo");
    			toggle_class(svg, "bumper_mode", /*bumper_mode*/ ctx[5]);
    			add_location(svg, file$1, 9, 0, 252);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, svg, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(svg, null);
    			}

    			append_dev(svg, each0_anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			append_dev(svg, each1_anchor);
    			if (if_block0) if_block0.m(svg, null);
    			append_dev(svg, if_block0_anchor);
    			if (if_block1) if_block1.m(svg, null);
    			append_dev(svg, if_block1_anchor);
    			if (if_block2) if_block2.m(svg, null);
    			append_dev(svg, if_block2_anchor);
    			if (if_block3) if_block3.m(svg, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};
    			if (dirty[0] & /*method*/ 1) card_changes.method = /*method*/ ctx[0];
    			if (dirty[0] & /*place_bell*/ 8) card_changes.bell = /*place_bell*/ ctx[3];
    			if (dirty[0] & /*canvas_width*/ 4096) card_changes.width = /*canvas_width*/ ctx[12];
    			if (dirty[0] & /*cardtext_small*/ 1024) card_changes.small = /*cardtext_small*/ ctx[10];
    			card.$set(card_changes);

    			if (dirty[0] & /*stage, calcH*/ 262146) {
    				each_value_2 = Array(/*stage*/ ctx[1] - 1);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(svg, each0_anchor);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*stage, calcH, canvas_height*/ 270338) {
    				each_value_1 = Array(/*stage*/ ctx[1]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, each1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*mistake*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*mistake*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(svg, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*blueline*/ ctx[4].length != 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(svg, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*treble_path*/ ctx[2].length != 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3(ctx);
    					if_block2.c();
    					if_block2.m(svg, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*$card_complete*/ ctx[14] && mistakes > 0) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2$1(ctx);
    					if_block3.c();
    					if_block3.m(svg, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (!current || dirty[0] & /*canvas_width*/ 4096) {
    				set_style(svg, "width", /*canvas_width*/ ctx[12]);
    			}

    			if (!current || dirty[0] & /*canvas_height*/ 8192) {
    				set_style(svg, "height", /*canvas_height*/ ctx[13]);
    			}

    			if (!current || dirty[0] & /*canvas_width, canvas_height*/ 12288 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*canvas_width*/ ctx[12] + " " + /*canvas_height*/ ctx[13])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty[0] & /*bumper_mode*/ 32) {
    				toggle_class(svg, "bumper_mode", /*bumper_mode*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(5:0) {#if innerWidth}",
    		ctx
    	});

    	return block;
    }

    // (16:2) {#each Array(stage-1) as _, i}
    function create_each_block_2(ctx) {
    	let line;
    	let line_x__value;
    	let line_x__value_1;
    	let line_stroke_dasharray_value;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x1", line_x__value = (/*stage*/ ctx[1], /*calcH*/ ctx[18](/*i*/ ctx[46] + 1.5)));
    			attr_dev(line, "y1", "-10");
    			attr_dev(line, "x2", line_x__value_1 = (/*stage*/ ctx[1], /*calcH*/ ctx[18](/*i*/ ctx[46] + 1.5)));
    			attr_dev(line, "y2", "910");
    			set_style(line, "stroke", "rgba(0,0,0, 0.125)");
    			set_style(line, "stroke-width", "2");
    			attr_dev(line, "stroke-dasharray", line_stroke_dasharray_value = /*i*/ ctx[46] % 2 == 0 ? "4,4" : "0");
    			add_location(line, file$1, 16, 4, 487);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*stage*/ 2 && line_x__value !== (line_x__value = (/*stage*/ ctx[1], /*calcH*/ ctx[18](/*i*/ ctx[46] + 1.5)))) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty[0] & /*stage*/ 2 && line_x__value_1 !== (line_x__value_1 = (/*stage*/ ctx[1], /*calcH*/ ctx[18](/*i*/ ctx[46] + 1.5)))) {
    				attr_dev(line, "x2", line_x__value_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(16:2) {#each Array(stage-1) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (24:2) {#each Array(stage) as _, i}
    function create_each_block_1(ctx) {
    	let text0;
    	let t0_value = bellName(/*i*/ ctx[46] + 1) + "";
    	let t0;
    	let text0_x_value;
    	let text1;
    	let t1_value = bellName(/*i*/ ctx[46] + 1) + "";
    	let t1;
    	let text1_x_value;
    	let text1_y_value;

    	const block = {
    		c: function create() {
    			text0 = svg_element("text");
    			t0 = text(t0_value);
    			text1 = svg_element("text");
    			t1 = text(t1_value);
    			attr_dev(text0, "x", text0_x_value = (/*stage*/ ctx[1], /*calcH*/ ctx[18](/*i*/ ctx[46] + 1)));
    			attr_dev(text0, "y", "20");
    			attr_dev(text0, "text-anchor", "middle");
    			add_location(text0, file$1, 24, 4, 760);
    			attr_dev(text1, "x", text1_x_value = (/*stage*/ ctx[1], /*calcH*/ ctx[18](/*i*/ ctx[46] + 1)));
    			attr_dev(text1, "y", text1_y_value = /*canvas_height*/ ctx[13] - 10);
    			attr_dev(text1, "text-anchor", "middle");
    			add_location(text1, file$1, 27, 4, 859);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text0, anchor);
    			append_dev(text0, t0);
    			insert_dev(target, text1, anchor);
    			append_dev(text1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*stage*/ 2 && text0_x_value !== (text0_x_value = (/*stage*/ ctx[1], /*calcH*/ ctx[18](/*i*/ ctx[46] + 1)))) {
    				attr_dev(text0, "x", text0_x_value);
    			}

    			if (dirty[0] & /*stage*/ 2 && text1_x_value !== (text1_x_value = (/*stage*/ ctx[1], /*calcH*/ ctx[18](/*i*/ ctx[46] + 1)))) {
    				attr_dev(text1, "x", text1_x_value);
    			}

    			if (dirty[0] & /*canvas_height*/ 8192 && text1_y_value !== (text1_y_value = /*canvas_height*/ ctx[13] - 10)) {
    				attr_dev(text1, "y", text1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text0);
    			if (detaching) detach_dev(text1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(24:2) {#each Array(stage) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (33:2) {#if mistake}
    function create_if_block_5(ctx) {
    	let rect;
    	let rect_transition;
    	let current;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "-10");
    			attr_dev(rect, "width", "400");
    			attr_dev(rect, "height", "920");
    			attr_dev(rect, "fill", "rgba(0,0,0,0.5)");
    			add_location(rect, file$1, 33, 4, 1003);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!rect_transition) rect_transition = create_bidirectional_transition(rect, fade, { duration: 100, easing: sineInOut }, true);
    				rect_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!rect_transition) rect_transition = create_bidirectional_transition(rect, fade, { duration: 100, easing: sineInOut }, false);
    			rect_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    			if (detaching && rect_transition) rect_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(33:2) {#if mistake}",
    		ctx
    	});

    	return block;
    }

    // (39:2) {#if blueline.length != 0}
    function create_if_block_4(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let path;
    	let path_d_value;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			path = svg_element("path");

    			attr_dev(circle, "cx", circle_cx_value = /*calcH*/ ctx[18](/*bumper_mode*/ ctx[5]
    			? /*blueline*/ ctx[4][/*cur_row*/ ctx[11]]
    			: /*free_blueline*/ ctx[7][/*cur_row*/ ctx[11]]));

    			attr_dev(circle, "cy", circle_cy_value = /*calcV*/ ctx[19](/*cur_row*/ ctx[11]));
    			attr_dev(circle, "r", "8");
    			attr_dev(circle, "fill", /*line_color*/ ctx[16]);
    			attr_dev(circle, "class", "blueline");
    			add_location(circle, file$1, 40, 4, 1182);
    			attr_dev(path, "fill", "transparent");
    			attr_dev(path, "stroke", /*line_color*/ ctx[16]);
    			attr_dev(path, "stroke-width", "4");
    			attr_dev(path, "stroke-linecap", "round");

    			attr_dev(path, "d", path_d_value = /*getPathString*/ ctx[20](/*cur_row*/ ctx[11], /*bumper_mode*/ ctx[5]
    			? /*blueline*/ ctx[4]
    			: /*free_blueline*/ ctx[7]));

    			add_location(path, file$1, 43, 4, 1345);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*bumper_mode, blueline, cur_row, free_blueline*/ 2224 && circle_cx_value !== (circle_cx_value = /*calcH*/ ctx[18](/*bumper_mode*/ ctx[5]
    			? /*blueline*/ ctx[4][/*cur_row*/ ctx[11]]
    			: /*free_blueline*/ ctx[7][/*cur_row*/ ctx[11]]))) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty[0] & /*cur_row*/ 2048 && circle_cy_value !== (circle_cy_value = /*calcV*/ ctx[19](/*cur_row*/ ctx[11]))) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty[0] & /*cur_row, bumper_mode, blueline, free_blueline*/ 2224 && path_d_value !== (path_d_value = /*getPathString*/ ctx[20](/*cur_row*/ ctx[11], /*bumper_mode*/ ctx[5]
    			? /*blueline*/ ctx[4]
    			: /*free_blueline*/ ctx[7]))) {
    				attr_dev(path, "d", path_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(39:2) {#if blueline.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (49:2) {#if treble_path.length != 0}
    function create_if_block_3(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let path;
    	let path_d_value;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			path = svg_element("path");
    			attr_dev(circle, "cx", circle_cx_value = /*calcH*/ ctx[18](/*treble_path*/ ctx[2][/*cur_row*/ ctx[11]]));
    			attr_dev(circle, "cy", circle_cy_value = /*calcV*/ ctx[19](/*cur_row*/ ctx[11]));
    			attr_dev(circle, "r", "5");
    			attr_dev(circle, "fill", "red");
    			attr_dev(circle, "class", "treble");
    			add_location(circle, file$1, 50, 4, 1556);
    			attr_dev(path, "fill", "transparent");
    			attr_dev(path, "stroke", "red");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "d", path_d_value = /*getPathString*/ ctx[20](/*cur_row*/ ctx[11], /*treble_path*/ ctx[2]));
    			add_location(path, file$1, 53, 4, 1672);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*treble_path, cur_row*/ 2052 && circle_cx_value !== (circle_cx_value = /*calcH*/ ctx[18](/*treble_path*/ ctx[2][/*cur_row*/ ctx[11]]))) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty[0] & /*cur_row*/ 2048 && circle_cy_value !== (circle_cy_value = /*calcV*/ ctx[19](/*cur_row*/ ctx[11]))) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty[0] & /*cur_row, treble_path*/ 2052 && path_d_value !== (path_d_value = /*getPathString*/ ctx[20](/*cur_row*/ ctx[11], /*treble_path*/ ctx[2]))) {
    				attr_dev(path, "d", path_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(49:2) {#if treble_path.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (59:2) {#if $card_complete && mistakes > 0 }
    function create_if_block_2$1(ctx) {
    	let each_1_anchor;
    	let each_value = Array(/*cur_row*/ ctx[11]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*calcH, blueline, calcV, $card_complete, faded_color, line_color, cur_row*/ 1001488) {
    				each_value = Array(/*cur_row*/ ctx[11]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(59:2) {#if $card_complete && mistakes > 0 }",
    		ctx
    	});

    	return block;
    }

    // (61:4) {#each Array(cur_row) as _, i}
    function create_each_block(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let circle_fill_value;
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			line = svg_element("line");
    			attr_dev(circle, "cx", circle_cx_value = /*calcH*/ ctx[18](/*blueline*/ ctx[4][/*cur_row*/ ctx[11]]));
    			attr_dev(circle, "cy", circle_cy_value = /*calcV*/ ctx[19](/*cur_row*/ ctx[11]));
    			attr_dev(circle, "r", "8");

    			attr_dev(circle, "fill", circle_fill_value = /*$card_complete*/ ctx[14]
    			? /*faded_color*/ ctx[17]
    			: /*line_color*/ ctx[16]);

    			attr_dev(circle, "class", "correction");
    			add_location(circle, file$1, 62, 4, 1891);
    			attr_dev(line, "x1", line_x__value = /*calcH*/ ctx[18](/*blueline*/ ctx[4][/*i*/ ctx[46]]));
    			attr_dev(line, "y1", line_y__value = /*calcV*/ ctx[19](/*i*/ ctx[46]));
    			attr_dev(line, "x2", line_x__value_1 = /*calcH*/ ctx[18](/*blueline*/ ctx[4][/*i*/ ctx[46] + 1]));
    			attr_dev(line, "y2", line_y__value_1 = /*calcV*/ ctx[19](/*i*/ ctx[46] + 1));

    			set_style(line, "stroke", /*$card_complete*/ ctx[14]
    			? /*faded_color*/ ctx[17]
    			: /*line_color*/ ctx[16]);

    			attr_dev(line, "stroke-width", "4");
    			attr_dev(line, "stroke-linecap", "round");
    			attr_dev(line, "class", "correction");
    			add_location(line, file$1, 65, 8, 2052);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*blueline, cur_row*/ 2064 && circle_cx_value !== (circle_cx_value = /*calcH*/ ctx[18](/*blueline*/ ctx[4][/*cur_row*/ ctx[11]]))) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty[0] & /*cur_row*/ 2048 && circle_cy_value !== (circle_cy_value = /*calcV*/ ctx[19](/*cur_row*/ ctx[11]))) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty[0] & /*$card_complete*/ 16384 && circle_fill_value !== (circle_fill_value = /*$card_complete*/ ctx[14]
    			? /*faded_color*/ ctx[17]
    			: /*line_color*/ ctx[16])) {
    				attr_dev(circle, "fill", circle_fill_value);
    			}

    			if (dirty[0] & /*blueline*/ 16 && line_x__value !== (line_x__value = /*calcH*/ ctx[18](/*blueline*/ ctx[4][/*i*/ ctx[46]]))) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty[0] & /*blueline*/ 16 && line_x__value_1 !== (line_x__value_1 = /*calcH*/ ctx[18](/*blueline*/ ctx[4][/*i*/ ctx[46] + 1]))) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty[0] & /*$card_complete*/ 16384) {
    				set_style(line, "stroke", /*$card_complete*/ ctx[14]
    				? /*faded_color*/ ctx[17]
    				: /*line_color*/ ctx[16]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(61:4) {#each Array(cur_row) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (79:0) {#if detectMob()}
    function create_if_block$1(ctx) {
    	let touchhandler;
    	let t0;
    	let div3;
    	let div0;
    	let i0;
    	let t1;
    	let div1;
    	let i1;
    	let t2;
    	let div2;
    	let i2;
    	let current;

    	touchhandler = new TouchHandler({
    			props: { width: /*innerWidth*/ ctx[8] },
    			$$inline: true
    		});

    	touchhandler.$on("touch", /*touch_handler*/ ctx[29]);
    	touchhandler.$on("done", /*done_handler*/ ctx[30]);

    	const block = {
    		c: function create() {
    			create_component(touchhandler.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t1 = space();
    			div1 = element("div");
    			i1 = element("i");
    			t2 = space();
    			div2 = element("div");
    			i2 = element("i");
    			attr_dev(i0, "id", "leftArrow");
    			attr_dev(i0, "class", "fas fa-arrow-alt-circle-left svelte-1cxsslo");
    			add_location(i0, file$1, 85, 4, 2594);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$1, 84, 2, 2572);
    			attr_dev(i1, "id", "downArrow");
    			attr_dev(i1, "class", "fas fa-arrow-alt-circle-down");
    			add_location(i1, file$1, 88, 4, 2687);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file$1, 87, 2, 2665);
    			attr_dev(i2, "id", "rightArrow");
    			attr_dev(i2, "class", "fas fa-arrow-alt-circle-right svelte-1cxsslo");
    			add_location(i2, file$1, 91, 4, 2780);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$1, 90, 2, 2758);
    			attr_dev(div3, "class", "row svelte-1cxsslo");
    			add_location(div3, file$1, 83, 0, 2552);
    		},
    		m: function mount(target, anchor) {
    			mount_component(touchhandler, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, i0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, i1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, i2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const touchhandler_changes = {};
    			if (dirty[0] & /*innerWidth*/ 256) touchhandler_changes.width = /*innerWidth*/ ctx[8];
    			touchhandler.$set(touchhandler_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(touchhandler.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(touchhandler.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(touchhandler, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(79:0) {#if detectMob()}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t;
    	let show_if = detectMob();
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[28]);
    	let if_block0 = /*innerWidth*/ ctx[8] && create_if_block_1$1(ctx);
    	let if_block1 = show_if && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*keyDownHandler*/ ctx[23], false, false, false),
    					listen_dev(window, "keyup", /*keyUpHandler*/ ctx[24], false, false, false),
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[28])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*innerWidth*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*innerWidth*/ 256) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (show_if) if_block1.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $card_complete;
    	let $mistakes;
    	validate_store(card_complete, "card_complete");
    	component_subscribe($$self, card_complete, $$value => $$invalidate(14, $card_complete = $$value));
    	validate_store(mistakes, "mistakes");
    	component_subscribe($$self, mistakes, $$value => $$invalidate(35, $mistakes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MethodDisplay", slots, []);
    	const dispatch = createEventDispatcher();
    	let { id = null } = $$props;
    	let { method = null } = $$props;
    	let { stage = 8 } = $$props;
    	let { treble_path = [] } = $$props;
    	let { place_bell = 1 } = $$props;
    	let { blueline = [] } = $$props;
    	let { lead_length = 32 } = $$props;
    	let { cards_shown } = $$props;
    	let { bumper_mode } = $$props;
    	let debounce = false;
    	let input_dir;
    	let mistake;
    	let free_blueline = [place_bell];
    	let innerWidth;
    	let innerHeight;
    	let cardtext_small = false;
    	var treble_pos = 1;
    	var cur_row = 0;
    	var cur_pos = place_bell;
    	var prev_pos = cur_pos;
    	var grid_color = "#fff";
    	var line_color = "#05a";
    	var faded_color = "#6bf";
    	var vertical_offset = 40;

    	function calcH(place) {
    		var place_width = canvas_width / stage;
    		return (place - 0.5) * place_width;
    	}

    	function calcV(row) {
    		var row_height = (canvas_height - 2 * vertical_offset) / lead_length;
    		return row * row_height + vertical_offset;
    	}

    	function getPathString(row, positions) {
    		let path_string = "M" + calcH(positions[0]) + " " + calcV(0);

    		for (let i = 1; i <= row; i++) {
    			path_string += "L" + calcH(positions[i]) + " " + calcV(i);
    		}

    		return path_string;
    	}

    	function resetAll() {
    		$$invalidate(11, cur_row = 0);
    		cur_pos = place_bell;
    		treble_pos = 1;
    		$$invalidate(7, free_blueline = [place_bell]);
    		gave_up = false;
    	}

    	function calcLineDiff() {
    		let diff_array = [];
    		let local_mistakes = 0;

    		for (let i = 0; i < free_blueline.length; i++) {
    			diff_array.push(blueline[i] - free_blueline[i]);
    		}

    		for (let i = 1; i < diff_array.length; i++) {
    			if (diff_array[i] != diff_array[i - 1] && diff_array[i] != 0) {
    				local_mistakes += 1;
    			}
    		}

    		return local_mistakes;
    	}

    	let gave_up = false;

    	function reportResults() {
    		if (!bumper_mode) {
    			set_store_value(mistakes, $mistakes = calcLineDiff(), $mistakes);
    		} else {
    			set_store_value(mistakes, $mistakes = 0, $mistakes);
    		}

    		dispatch("report_results", {
    			mistakes: $mistakes,
    			gave_up,
    			bumper_mode
    		});
    	}

    	function updateBumper(dir) {
    		if (blueline[cur_row] + dir == blueline[cur_row + 1]) {
    			$$invalidate(11, cur_row += 1);
    		} else {
    			$$invalidate(6, mistake = true);

    			setTimeout(
    				() => {
    					$$invalidate(6, mistake = false);
    				},
    				100
    			);
    		}
    	}

    	function updateFree(dir) {
    		if (cur_pos + dir == treble_path[cur_row + 1]) {
    			$$invalidate(6, mistake = true);

    			setTimeout(
    				() => {
    					$$invalidate(6, mistake = false);
    				},
    				100
    			);

    			return;
    		}

    		if (cur_pos == 1 && dir == -1) {
    			return;
    		}

    		if (cur_pos == stage && dir == 1) {
    			return;
    		}

    		$$invalidate(11, cur_row += 1);
    		cur_pos += dir;
    		free_blueline.push(cur_pos);
    	}

    	function handleInput(dir) {
    		if ($card_complete) {
    			return;
    		}

    		let el;

    		if (detectMob()) {
    			switch (dir) {
    				case -1:
    					el = document.getElementById("leftArrow");
    					break;
    				case 0:
    					el = document.getElementById("downArrow");
    				case 1:
    					el = document.getElementById("rightArrow");
    			}

    			el.style.color = "red";
    			setTimeout(() => el.style.color = "black", 100);
    		}

    		if (bumper_mode) {
    			updateBumper(dir);
    		} else {
    			updateFree(dir);
    		}

    		
    	}

    	function keyDownHandler(e) {
    		if (debounce) {
    			return;
    		}

    		switch (e.key) {
    			case "ArrowLeft":
    				handleInput(-1);
    				break;
    			case "ArrowDown":
    				handleInput(0);
    				break;
    			case "ArrowRight":
    				handleInput(1);
    				break;
    			case "Escape":
    				resetAll();
    				if (!bumper_mode) {
    					dispatch("trigger_bumper");
    					gave_up = true;
    				}
    				return;
    			case "Space":
    			case "ArrowUp":
    			case "Enter":
    				resetAll();
    				if ($card_complete) {
    					dispatch("done");
    				}
    				return;
    			default:
    				return;
    		}
    	}

    	function keyUpHandler(e) {
    		debounce = false;
    	}

    	const writable_props = [
    		"id",
    		"method",
    		"stage",
    		"treble_path",
    		"place_bell",
    		"blueline",
    		"lead_length",
    		"cards_shown",
    		"bumper_mode"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MethodDisplay> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(8, innerWidth = window.innerWidth);
    		$$invalidate(9, innerHeight = window.innerHeight);
    	}

    	const touch_handler = e => handleInput(e.detail.dir);

    	const done_handler = e => {
    		resetAll();
    		dispatch("done");
    	};

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(25, id = $$props.id);
    		if ("method" in $$props) $$invalidate(0, method = $$props.method);
    		if ("stage" in $$props) $$invalidate(1, stage = $$props.stage);
    		if ("treble_path" in $$props) $$invalidate(2, treble_path = $$props.treble_path);
    		if ("place_bell" in $$props) $$invalidate(3, place_bell = $$props.place_bell);
    		if ("blueline" in $$props) $$invalidate(4, blueline = $$props.blueline);
    		if ("lead_length" in $$props) $$invalidate(26, lead_length = $$props.lead_length);
    		if ("cards_shown" in $$props) $$invalidate(27, cards_shown = $$props.cards_shown);
    		if ("bumper_mode" in $$props) $$invalidate(5, bumper_mode = $$props.bumper_mode);
    	};

    	$$self.$capture_state = () => ({
    		sineInOut,
    		fade,
    		onMount,
    		createEventDispatcher,
    		card_complete,
    		cards_today,
    		mistakes,
    		bellName,
    		detectMob,
    		Card,
    		TouchHandler,
    		dispatch,
    		id,
    		method,
    		stage,
    		treble_path,
    		place_bell,
    		blueline,
    		lead_length,
    		cards_shown,
    		bumper_mode,
    		debounce,
    		input_dir,
    		mistake,
    		free_blueline,
    		innerWidth,
    		innerHeight,
    		cardtext_small,
    		treble_pos,
    		cur_row,
    		cur_pos,
    		prev_pos,
    		grid_color,
    		line_color,
    		faded_color,
    		vertical_offset,
    		calcH,
    		calcV,
    		getPathString,
    		resetAll,
    		calcLineDiff,
    		gave_up,
    		reportResults,
    		updateBumper,
    		updateFree,
    		handleInput,
    		keyDownHandler,
    		keyUpHandler,
    		canvas_width,
    		canvas_height,
    		$card_complete,
    		$mistakes
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(25, id = $$props.id);
    		if ("method" in $$props) $$invalidate(0, method = $$props.method);
    		if ("stage" in $$props) $$invalidate(1, stage = $$props.stage);
    		if ("treble_path" in $$props) $$invalidate(2, treble_path = $$props.treble_path);
    		if ("place_bell" in $$props) $$invalidate(3, place_bell = $$props.place_bell);
    		if ("blueline" in $$props) $$invalidate(4, blueline = $$props.blueline);
    		if ("lead_length" in $$props) $$invalidate(26, lead_length = $$props.lead_length);
    		if ("cards_shown" in $$props) $$invalidate(27, cards_shown = $$props.cards_shown);
    		if ("bumper_mode" in $$props) $$invalidate(5, bumper_mode = $$props.bumper_mode);
    		if ("debounce" in $$props) debounce = $$props.debounce;
    		if ("input_dir" in $$props) input_dir = $$props.input_dir;
    		if ("mistake" in $$props) $$invalidate(6, mistake = $$props.mistake);
    		if ("free_blueline" in $$props) $$invalidate(7, free_blueline = $$props.free_blueline);
    		if ("innerWidth" in $$props) $$invalidate(8, innerWidth = $$props.innerWidth);
    		if ("innerHeight" in $$props) $$invalidate(9, innerHeight = $$props.innerHeight);
    		if ("cardtext_small" in $$props) $$invalidate(10, cardtext_small = $$props.cardtext_small);
    		if ("treble_pos" in $$props) treble_pos = $$props.treble_pos;
    		if ("cur_row" in $$props) $$invalidate(11, cur_row = $$props.cur_row);
    		if ("cur_pos" in $$props) cur_pos = $$props.cur_pos;
    		if ("prev_pos" in $$props) prev_pos = $$props.prev_pos;
    		if ("grid_color" in $$props) grid_color = $$props.grid_color;
    		if ("line_color" in $$props) $$invalidate(16, line_color = $$props.line_color);
    		if ("faded_color" in $$props) $$invalidate(17, faded_color = $$props.faded_color);
    		if ("vertical_offset" in $$props) vertical_offset = $$props.vertical_offset;
    		if ("gave_up" in $$props) gave_up = $$props.gave_up;
    		if ("canvas_width" in $$props) $$invalidate(12, canvas_width = $$props.canvas_width);
    		if ("canvas_height" in $$props) $$invalidate(13, canvas_height = $$props.canvas_height);
    	};

    	let canvas_width;
    	let canvas_height;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*innerWidth*/ 256) {
    			 $$invalidate(12, canvas_width = Math.min(400, innerWidth - 25));
    		}

    		if ($$self.$$.dirty[0] & /*innerHeight*/ 512) {
    			 $$invalidate(13, canvas_height = Math.min(900, innerHeight - 150));
    		}

    		if ($$self.$$.dirty[0] & /*canvas_width*/ 4096) {
    			 $$invalidate(10, cardtext_small = canvas_width < 400);
    		}

    		if ($$self.$$.dirty[0] & /*cur_row, lead_length*/ 67110912) {
    			/* $: $cards_so_far, resetAll(); */
    			 set_store_value(card_complete, $card_complete = cur_row >= lead_length, $card_complete);
    		}

    		if ($$self.$$.dirty[0] & /*cards_shown*/ 134217728) {
    			 (resetAll());
    		}

    		if ($$self.$$.dirty[0] & /*$card_complete*/ 16384) {
    			 if ($card_complete) {
    				reportResults();
    			}
    		}
    	};

    	return [
    		method,
    		stage,
    		treble_path,
    		place_bell,
    		blueline,
    		bumper_mode,
    		mistake,
    		free_blueline,
    		innerWidth,
    		innerHeight,
    		cardtext_small,
    		cur_row,
    		canvas_width,
    		canvas_height,
    		$card_complete,
    		dispatch,
    		line_color,
    		faded_color,
    		calcH,
    		calcV,
    		getPathString,
    		resetAll,
    		handleInput,
    		keyDownHandler,
    		keyUpHandler,
    		id,
    		lead_length,
    		cards_shown,
    		onwindowresize,
    		touch_handler,
    		done_handler
    	];
    }

    class MethodDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				id: 25,
    				method: 0,
    				stage: 1,
    				treble_path: 2,
    				place_bell: 3,
    				blueline: 4,
    				lead_length: 26,
    				cards_shown: 27,
    				bumper_mode: 5
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MethodDisplay",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cards_shown*/ ctx[27] === undefined && !("cards_shown" in props)) {
    			console.warn("<MethodDisplay> was created without expected prop 'cards_shown'");
    		}

    		if (/*bumper_mode*/ ctx[5] === undefined && !("bumper_mode" in props)) {
    			console.warn("<MethodDisplay> was created without expected prop 'bumper_mode'");
    		}
    	}

    	get id() {
    		throw new Error("<MethodDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<MethodDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get method() {
    		throw new Error("<MethodDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set method(value) {
    		throw new Error("<MethodDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stage() {
    		throw new Error("<MethodDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stage(value) {
    		throw new Error("<MethodDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get treble_path() {
    		throw new Error("<MethodDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set treble_path(value) {
    		throw new Error("<MethodDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get place_bell() {
    		throw new Error("<MethodDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set place_bell(value) {
    		throw new Error("<MethodDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get blueline() {
    		throw new Error("<MethodDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set blueline(value) {
    		throw new Error("<MethodDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lead_length() {
    		throw new Error("<MethodDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lead_length(value) {
    		throw new Error("<MethodDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cards_shown() {
    		throw new Error("<MethodDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cards_shown(value) {
    		throw new Error("<MethodDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bumper_mode() {
    		throw new Error("<MethodDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bumper_mode(value) {
    		throw new Error("<MethodDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Metadata.svelte generated by Svelte v3.29.4 */
    const file$2 = "src/Metadata.svelte";

    // (83:0) {#if bumper_mode && !$card_complete}
    function create_if_block_2$2(ctx) {
    	let div1;
    	let div0;
    	let h5;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = "Bumper mode";
    			t1 = space();
    			p = element("p");
    			p.textContent = "The card will prevent you from making mistakes this time through.";
    			attr_dev(h5, "class", "card-title");
    			add_location(h5, file$2, 85, 6, 1370);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file$2, 88, 6, 1432);
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$2, 84, 4, 1340);
    			attr_dev(div1, "class", "card mb-2 svelte-1qpilf7");
    			add_location(div1, file$2, 83, 2, 1312);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(83:0) {#if bumper_mode && !$card_complete}",
    		ctx
    	});

    	return block;
    }

    // (97:0) {#if $card_complete}
    function create_if_block$2(ctx) {
    	let div1;
    	let div0;

    	function select_block_type(ctx, dirty) {
    		if (/*bumper_mode*/ ctx[0]) return create_if_block_1$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$2, 98, 4, 1618);
    			attr_dev(div1, "class", "card mb-2 svelte-1qpilf7");
    			add_location(div1, file$2, 97, 2, 1590);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_block.m(div0, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(97:0) {#if $card_complete}",
    		ctx
    	});

    	return block;
    }

    // (107:6) {:else}
    function create_else_block$1(ctx) {
    	let h5;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let p;

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			t0 = text(/*done_message*/ ctx[1]);
    			t1 = text(" — ");
    			t2 = text(/*$mistakes*/ ctx[2]);
    			t3 = text(" mistakes");
    			t4 = space();
    			p = element("p");
    			p.textContent = "Press Enter or Up to progress.";
    			attr_dev(h5, "class", "card-title");
    			add_location(h5, file$2, 107, 8, 1842);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file$2, 110, 8, 1936);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			append_dev(h5, t0);
    			append_dev(h5, t1);
    			append_dev(h5, t2);
    			append_dev(h5, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*done_message*/ 2) set_data_dev(t0, /*done_message*/ ctx[1]);
    			if (dirty & /*$mistakes*/ 4) set_data_dev(t2, /*$mistakes*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(107:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (100:6) {#if bumper_mode}
    function create_if_block_1$2(ctx) {
    	let h5;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			h5.textContent = "Good";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Bumper mode will be disabled next time.";
    			attr_dev(h5, "class", "card-title");
    			add_location(h5, file$2, 100, 8, 1674);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file$2, 103, 8, 1735);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(100:6) {#if bumper_mode}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let h3;
    	let t1;
    	let ul;
    	let li0;
    	let h6;
    	let a;
    	let i;
    	let t2;
    	let t3;
    	let li1;
    	let t4;
    	let span;
    	let t5;
    	let t6;
    	let t7;
    	let if_block1_anchor;
    	let if_block0 = /*bumper_mode*/ ctx[0] && !/*$card_complete*/ ctx[4] && create_if_block_2$2(ctx);
    	let if_block1 = /*$card_complete*/ ctx[4] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Method Tutor";
    			t1 = space();
    			ul = element("ul");
    			li0 = element("li");
    			h6 = element("h6");
    			a = element("a");
    			i = element("i");
    			t2 = text("\n          Settings");
    			t3 = space();
    			li1 = element("li");
    			t4 = text("Cards remaining:");
    			span = element("span");
    			t5 = text(/*$cards_today*/ ctx[3]);
    			t6 = space();
    			if (if_block0) if_block0.c();
    			t7 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(h3, "class", "card-title mt-3 mb-3");
    			add_location(h3, file$2, 55, 4, 767);
    			attr_dev(div0, "class", "card-body py-0");
    			add_location(div0, file$2, 52, 2, 732);
    			attr_dev(i, "class", "fas fa-cog");
    			add_location(i, file$2, 67, 10, 1048);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "data-toggle", "modal");
    			attr_dev(a, "data-target", "#cardManager");
    			attr_dev(a, "class", "svelte-1qpilf7");
    			add_location(a, file$2, 66, 8, 978);
    			add_location(h6, file$2, 65, 6, 964);
    			attr_dev(li0, "class", "list-group-item list-group-item-action px-3 pt-3 mb-n1");
    			add_location(li0, file$2, 63, 4, 889);
    			attr_dev(span, "class", "float-right");
    			add_location(span, file$2, 76, 22, 1198);
    			attr_dev(li1, "class", "list-group-item p-3 p-lg-4");
    			add_location(li1, file$2, 75, 4, 1136);
    			attr_dev(ul, "class", "list-group list-group-flush");
    			add_location(ul, file$2, 61, 2, 843);
    			attr_dev(div1, "class", "card mb-2 svelte-1qpilf7");
    			add_location(div1, file$2, 51, 0, 706);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(div1, t1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, h6);
    			append_dev(h6, a);
    			append_dev(a, i);
    			append_dev(a, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, t4);
    			append_dev(li1, span);
    			append_dev(span, t5);
    			insert_dev(target, t6, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$cards_today*/ 8) set_data_dev(t5, /*$cards_today*/ ctx[3]);

    			if (/*bumper_mode*/ ctx[0] && !/*$card_complete*/ ctx[4]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					if_block0.m(t7.parentNode, t7);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$card_complete*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t6);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $mistakes;
    	let $cards_today;
    	let $card_complete;
    	validate_store(mistakes, "mistakes");
    	component_subscribe($$self, mistakes, $$value => $$invalidate(2, $mistakes = $$value));
    	validate_store(cards_today, "cards_today");
    	component_subscribe($$self, cards_today, $$value => $$invalidate(3, $cards_today = $$value));
    	validate_store(card_complete, "card_complete");
    	component_subscribe($$self, card_complete, $$value => $$invalidate(4, $card_complete = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Metadata", slots, []);
    	let { bumper_mode } = $$props;
    	let done_message;
    	const writable_props = ["bumper_mode"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Metadata> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("bumper_mode" in $$props) $$invalidate(0, bumper_mode = $$props.bumper_mode);
    	};

    	$$self.$capture_state = () => ({
    		cards_today,
    		mistakes,
    		card_complete,
    		bumper_mode,
    		done_message,
    		$mistakes,
    		$cards_today,
    		$card_complete
    	});

    	$$self.$inject_state = $$props => {
    		if ("bumper_mode" in $$props) $$invalidate(0, bumper_mode = $$props.bumper_mode);
    		if ("done_message" in $$props) $$invalidate(1, done_message = $$props.done_message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$mistakes*/ 4) {
    			 switch ($mistakes) {
    				case 0:
    					$$invalidate(1, done_message = "Easy");
    					break;
    				case 1:
    				case 2:
    					$$invalidate(1, done_message = "Good");
    					break;
    				case 3:
    				case 4:
    					$$invalidate(1, done_message = "Hard");
    					break;
    				default:
    					$$invalidate(1, done_message = "Relearn");
    					break;
    			}
    		}
    	};

    	return [bumper_mode, done_message, $mistakes, $cards_today, $card_complete];
    }

    class Metadata extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { bumper_mode: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Metadata",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*bumper_mode*/ ctx[0] === undefined && !("bumper_mode" in props)) {
    			console.warn("<Metadata> was created without expected prop 'bumper_mode'");
    		}
    	}

    	get bumper_mode() {
    		throw new Error("<Metadata>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bumper_mode(value) {
    		throw new Error("<Metadata>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    async function get(url){
        const response = await fetch('./api/' + url);
        const text = await response.json();
        if (response.ok) {
            return text;
        } else {
            throw new Error(text);
        }
    }

    /* Record results */
    async function post(url, data){
        const response = await fetch('./api/' + url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });
        const json = await response.json();
        if (response.ok){
            return json;
        } else {
            throw new Error(json);
        }
    }

    /* Delete records */
    async function httpDel(url, data){
        const response = await fetch('./api/' + url,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var dayjs_min = createCommonjsModule(function (module, exports) {
    !function(t,e){module.exports=e();}(commonjsGlobal,function(){var t="millisecond",e="second",n="minute",r="hour",i="day",s="week",u="month",a="quarter",o="year",f="date",h=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d+)?$/,c=/\[([^\]]+)]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,d={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},$=function(t,e,n){var r=String(t);return !r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},l={s:$,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return (e<=0?"+":"-")+$(r,2,"0")+":"+$(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return -t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,u),s=n-i<0,a=e.clone().add(r+(s?-1:1),u);return +(-(r+(n-i)/(s?i-a:a-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(h){return {M:u,y:o,w:s,d:i,D:f,h:r,m:n,s:e,ms:t,Q:a}[h]||String(h||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},y="en",M={};M[y]=d;var m=function(t){return t instanceof S},D=function(t,e,n){var r;if(!t)return y;if("string"==typeof t)M[t]&&(r=t),e&&(M[t]=e,r=t);else {var i=t.name;M[i]=t,r=i;}return !n&&r&&(y=r),r||!n&&y},v=function(t,e){if(m(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new S(n)},g=l;g.l=D,g.i=m,g.w=function(t,e){return v(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var S=function(){function d(t){this.$L=D(t.locale,null,!0),this.parse(t);}var $=d.prototype;return $.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(g.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match(h);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.$x=t.x||{},this.init();},$.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds();},$.$utils=function(){return g},$.isValid=function(){return !("Invalid Date"===this.$d.toString())},$.isSame=function(t,e){var n=v(t);return this.startOf(e)<=n&&n<=this.endOf(e)},$.isAfter=function(t,e){return v(t)<this.startOf(e)},$.isBefore=function(t,e){return this.endOf(e)<v(t)},$.$g=function(t,e,n){return g.u(t)?this[e]:this.set(n,t)},$.unix=function(){return Math.floor(this.valueOf()/1e3)},$.valueOf=function(){return this.$d.getTime()},$.startOf=function(t,a){var h=this,c=!!g.u(a)||a,d=g.p(t),$=function(t,e){var n=g.w(h.$u?Date.UTC(h.$y,e,t):new Date(h.$y,e,t),h);return c?n:n.endOf(i)},l=function(t,e){return g.w(h.toDate()[t].apply(h.toDate("s"),(c?[0,0,0,0]:[23,59,59,999]).slice(e)),h)},y=this.$W,M=this.$M,m=this.$D,D="set"+(this.$u?"UTC":"");switch(d){case o:return c?$(1,0):$(31,11);case u:return c?$(1,M):$(0,M+1);case s:var v=this.$locale().weekStart||0,S=(y<v?y+7:y)-v;return $(c?m-S:m+(6-S),M);case i:case f:return l(D+"Hours",0);case r:return l(D+"Minutes",1);case n:return l(D+"Seconds",2);case e:return l(D+"Milliseconds",3);default:return this.clone()}},$.endOf=function(t){return this.startOf(t,!1)},$.$set=function(s,a){var h,c=g.p(s),d="set"+(this.$u?"UTC":""),$=(h={},h[i]=d+"Date",h[f]=d+"Date",h[u]=d+"Month",h[o]=d+"FullYear",h[r]=d+"Hours",h[n]=d+"Minutes",h[e]=d+"Seconds",h[t]=d+"Milliseconds",h)[c],l=c===i?this.$D+(a-this.$W):a;if(c===u||c===o){var y=this.clone().set(f,1);y.$d[$](l),y.init(),this.$d=y.set(f,Math.min(this.$D,y.daysInMonth())).$d;}else $&&this.$d[$](l);return this.init(),this},$.set=function(t,e){return this.clone().$set(t,e)},$.get=function(t){return this[g.p(t)]()},$.add=function(t,a){var f,h=this;t=Number(t);var c=g.p(a),d=function(e){var n=v(h);return g.w(n.date(n.date()+Math.round(e*t)),h)};if(c===u)return this.set(u,this.$M+t);if(c===o)return this.set(o,this.$y+t);if(c===i)return d(1);if(c===s)return d(7);var $=(f={},f[n]=6e4,f[r]=36e5,f[e]=1e3,f)[c]||1,l=this.$d.getTime()+t*$;return g.w(l,this)},$.subtract=function(t,e){return this.add(-1*t,e)},$.format=function(t){var e=this;if(!this.isValid())return "Invalid Date";var n=t||"YYYY-MM-DDTHH:mm:ssZ",r=g.z(this),i=this.$locale(),s=this.$H,u=this.$m,a=this.$M,o=i.weekdays,f=i.months,h=function(t,r,i,s){return t&&(t[r]||t(e,n))||i[r].substr(0,s)},d=function(t){return g.s(s%12||12,t,"0")},$=i.meridiem||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r},l={YY:String(this.$y).slice(-2),YYYY:this.$y,M:a+1,MM:g.s(a+1,2,"0"),MMM:h(i.monthsShort,a,f,3),MMMM:h(f,a),D:this.$D,DD:g.s(this.$D,2,"0"),d:String(this.$W),dd:h(i.weekdaysMin,this.$W,o,2),ddd:h(i.weekdaysShort,this.$W,o,3),dddd:o[this.$W],H:String(s),HH:g.s(s,2,"0"),h:d(1),hh:d(2),a:$(s,u,!0),A:$(s,u,!1),m:String(u),mm:g.s(u,2,"0"),s:String(this.$s),ss:g.s(this.$s,2,"0"),SSS:g.s(this.$ms,3,"0"),Z:r};return n.replace(c,function(t,e){return e||l[t]||r.replace(":","")})},$.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},$.diff=function(t,f,h){var c,d=g.p(f),$=v(t),l=6e4*($.utcOffset()-this.utcOffset()),y=this-$,M=g.m(this,$);return M=(c={},c[o]=M/12,c[u]=M,c[a]=M/3,c[s]=(y-l)/6048e5,c[i]=(y-l)/864e5,c[r]=y/36e5,c[n]=y/6e4,c[e]=y/1e3,c)[d]||y,h?M:g.a(M)},$.daysInMonth=function(){return this.endOf(u).$D},$.$locale=function(){return M[this.$L]},$.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=D(t,e,!0);return r&&(n.$L=r),n},$.clone=function(){return g.w(this.$d,this)},$.toDate=function(){return new Date(this.valueOf())},$.toJSON=function(){return this.isValid()?this.toISOString():null},$.toISOString=function(){return this.$d.toISOString()},$.toString=function(){return this.$d.toUTCString()},d}(),p=S.prototype;return v.prototype=p,[["$ms",t],["$s",e],["$m",n],["$H",r],["$W",i],["$M",u],["$y",o],["$D",f]].forEach(function(t){p[t[1]]=function(e){return this.$g(e,t[0],t[1])};}),v.extend=function(t,e){return t(e,S,v),v},v.locale=D,v.isDayjs=m,v.unix=function(t){return v(1e3*t)},v.en=M[y],v.Ls=M,v.p={},v});
    });

    var relativeTime = createCommonjsModule(function (module, exports) {
    !function(r,t){module.exports=t();}(commonjsGlobal,function(){return function(r,t,e){r=r||{};var n=t.prototype,o={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};e.en.relativeTime=o;var d=function(t,n,d,i){for(var u,a,s,f=d.$locale().relativeTime||o,l=r.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],h=l.length,m=0;m<h;m+=1){var c=l[m];c.d&&(u=i?e(t).diff(d,c.d,!0):d.diff(t,c.d,!0));var y=(r.rounding||Math.round)(Math.abs(u));if(s=u>0,y<=c.r||!c.r){y<=1&&m>0&&(c=l[m-1]);var p=f[c.l];a="string"==typeof p?p.replace("%d",y):p(y,n,c.l,s);break}}return n?a:(s?f.future:f.past).replace("%s",a)};n.to=function(r,t){return d(r,t,this,!0)},n.from=function(r,t){return d(r,t,this)};var i=function(r){return r.$u?e.utc():e()};n.toNow=function(r){return this.to(i(this),r)},n.fromNow=function(r){return this.from(i(this),r)};}});
    });

    var isSameOrAfter = createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t();}(commonjsGlobal,function(){return function(e,t){t.prototype.isSameOrAfter=function(e,t){return this.isSame(e,t)||this.isAfter(e,t)};}});
    });

    var isTomorrow = createCommonjsModule(function (module, exports) {
    !function(o,t){module.exports=t();}(commonjsGlobal,function(){return function(o,t,e){t.prototype.isTomorrow=function(){var o=e().add(1,"day");return this.format("YYYY-MM-DD")===o.format("YYYY-MM-DD")};}});
    });

    var timezone = createCommonjsModule(function (module, exports) {
    !function(t,e){module.exports=e();}(commonjsGlobal,function(){var t={year:0,month:1,day:2,hour:3,minute:4,second:5},e={};return function(n,i,o){var r,u=o().utcOffset(),a=function(t,n,i){void 0===i&&(i={});var o=new Date(t);return function(t,n){void 0===n&&(n={});var i=n.timeZoneName||"short",o=t+"|"+i,r=e[o];return r||(r=new Intl.DateTimeFormat("en-US",{hour12:!1,timeZone:t,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",timeZoneName:i}),e[o]=r),r}(n,i).formatToParts(o)},f=function(e,n){for(var i=a(e,n),r=[],u=0;u<i.length;u+=1){var f=i[u],s=f.type,m=f.value,c=t[s];c>=0&&(r[c]=parseInt(m,10));}var d=r[3],v=24===d?0:d,h=r[0]+"-"+r[1]+"-"+r[2]+" "+v+":"+r[4]+":"+r[5]+":000",l=+e;return (o.utc(h).valueOf()-(l-=l%1e3))/6e4},s=i.prototype;s.tz=function(t,e){void 0===t&&(t=r);var n=this.utcOffset(),i=this.toDate().toLocaleString("en-US",{timeZone:t}),a=Math.round((this.toDate()-new Date(i))/1e3/60),f=o(i).$set("millisecond",this.$ms).utcOffset(u-a,!0);if(e){var s=f.utcOffset();f=f.add(n-s,"minute");}return f.$x.$timezone=t,f},s.offsetName=function(t){var e=this.$x.$timezone||o.tz.guess(),n=a(this.valueOf(),e,{timeZoneName:t}).find(function(t){return "timezonename"===t.type.toLowerCase()});return n&&n.value},o.tz=function(t,e,n){var i=n&&e,u=n||e||r,a=f(+o(),u);if("string"!=typeof t)return o(t).tz(u);var s=function(t,e,n){var i=t-60*e*1e3,o=f(i,n);if(e===o)return [i,e];var r=f(i-=60*(o-e)*1e3,n);return o===r?[i,o]:[t-60*Math.min(o,r)*1e3,Math.max(o,r)]}(o.utc(t,i).valueOf(),a,u),m=s[0],c=s[1],d=o(m).utcOffset(c);return d.$x.$timezone=u,d},o.tz.guess=function(){return Intl.DateTimeFormat().resolvedOptions().timeZone},o.tz.setDefault=function(t){r=t;};}});
    });

    var utc = createCommonjsModule(function (module, exports) {
    !function(t,i){module.exports=i();}(commonjsGlobal,function(){return function(t,i,e){var s=i.prototype;e.utc=function(t){return new i({date:t,utc:!0,args:arguments})},s.utc=function(t){var i=e(this.toDate(),{locale:this.$L,utc:!0});return t?i.add(this.utcOffset(),"minute"):i},s.local=function(){return e(this.toDate(),{locale:this.$L,utc:!1})};var f=s.parse;s.parse=function(t){t.utc&&(this.$u=!0),this.$utils().u(t.$offset)||(this.$offset=t.$offset),f.call(this,t);};var n=s.init;s.init=function(){if(this.$u){var t=this.$d;this.$y=t.getUTCFullYear(),this.$M=t.getUTCMonth(),this.$D=t.getUTCDate(),this.$W=t.getUTCDay(),this.$H=t.getUTCHours(),this.$m=t.getUTCMinutes(),this.$s=t.getUTCSeconds(),this.$ms=t.getUTCMilliseconds();}else n.call(this);};var u=s.utcOffset;s.utcOffset=function(t,i){var e=this.$utils().u;if(e(t))return this.$u?0:e(this.$offset)?u.call(this):this.$offset;var s=Math.abs(t)<=16?60*t:t,f=this;if(i)return f.$offset=s,f.$u=0===t,f;if(0!==t){var n=this.$u?this.toDate().getTimezoneOffset():-1*this.utcOffset();(f=this.local().add(s+n,"minute")).$offset=s,f.$x.$localOffset=n;}else f=this.utc();return f};var o=s.format;s.format=function(t){var i=t||(this.$u?"YYYY-MM-DDTHH:mm:ss[Z]":"");return o.call(this,i)},s.valueOf=function(){var t=this.$utils().u(this.$offset)?0:this.$offset+(this.$x.$localOffset||(new Date).getTimezoneOffset());return this.$d.valueOf()-6e4*t},s.isUTC=function(){return !!this.$u},s.toISOString=function(){return this.toDate().toISOString()},s.toString=function(){return this.toDate().toUTCString()};var r=s.toDate;s.toDate=function(t){return "s"===t&&this.$offset?e(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate():r.call(this)};var a=s.diff;s.diff=function(t,i,s){if(this.$u===t.$u)return a.call(this,t,i,s);var f=this.local(),n=e(t).local();return a.call(f,n,i,s)};}});
    });

    /* src/SortableTable.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1 } = globals;
    const file$3 = "src/SortableTable.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i][0];
    	child_ctx[12] = list[i][1];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i][0];
    	child_ctx[12] = list[i][1];
    	return child_ctx;
    }

    // (106:6) {#each Object.entries(headers) as [prop, header] (prop)}
    function create_each_block_2$1(key_1, ctx) {
    	let th;
    	let t0_value = /*header*/ ctx[12] + "";
    	let t0;
    	let t1;
    	let span;
    	let t2_value = (/*sortBy*/ ctx[3].ascending ? "▲" : "▼") + "";
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(span, "class", "svelte-qv4ins");
    			toggle_class(span, "hide", /*sortBy*/ ctx[3].col !== /*prop*/ ctx[11]);
    			add_location(span, file$3, 108, 8, 2512);
    			attr_dev(th, "scope", "col");
    			attr_dev(th, "class", "text-left clickable svelte-qv4ins");
    			add_location(th, file$3, 106, 6, 2420);
    			this.first = th;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);
    			append_dev(th, span);
    			append_dev(span, t2);

    			if (!mounted) {
    				dispose = listen_dev(
    					th,
    					"click",
    					function () {
    						if (is_function(/*sort*/ ctx[4](/*prop*/ ctx[11]))) /*sort*/ ctx[4](/*prop*/ ctx[11]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*headers*/ 2 && t0_value !== (t0_value = /*header*/ ctx[12] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*sortBy*/ 8 && t2_value !== (t2_value = (/*sortBy*/ ctx[3].ascending ? "▲" : "▼") + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*sortBy, Object, headers*/ 10) {
    				toggle_class(span, "hide", /*sortBy*/ ctx[3].col !== /*prop*/ ctx[11]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(106:6) {#each Object.entries(headers) as [prop, header] (prop)}",
    		ctx
    	});

    	return block;
    }

    // (112:6) {#if remove}
    function create_if_block_4$1(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			attr_dev(th, "scope", "col");
    			attr_dev(th, "class", "text-left");
    			add_location(th, file$3, 112, 8, 2644);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(112:6) {#if remove}",
    		ctx
    	});

    	return block;
    }

    // (118:2) {#if data.length == 0}
    function create_if_block_3$1(ctx) {
    	let tr;
    	let td;
    	let small;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td = element("td");
    			small = element("small");
    			small.textContent = "(no methods added)";
    			attr_dev(small, "class", "text-muted");
    			add_location(small, file$3, 120, 8, 2792);
    			attr_dev(td, "colspan", "42");
    			add_location(td, file$3, 119, 6, 2766);
    			add_location(tr, file$3, 118, 4, 2755);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td);
    			append_dev(td, small);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(118:2) {#if data.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (134:14) {:else}
    function create_else_block$2(ctx) {
    	let t_value = /*card*/ ctx[8][/*prop*/ ctx[11]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data, headers*/ 3 && t_value !== (t_value = /*card*/ ctx[8][/*prop*/ ctx[11]] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(134:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (132:45) 
    function create_if_block_2$3(ctx) {
    	let t_value = bellName(/*card*/ ctx[8].place_bell) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t_value !== (t_value = bellName(/*card*/ ctx[8].place_bell) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(132:45) ",
    		ctx
    	});

    	return block;
    }

    // (130:14) {#if prop === 'scheduled'}
    function create_if_block_1$3(ctx) {
    	let t_value = /*formatDate*/ ctx[5](/*card*/ ctx[8].scheduled) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*formatDate*/ ctx[5](/*card*/ ctx[8].scheduled) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(130:14) {#if prop === 'scheduled'}",
    		ctx
    	});

    	return block;
    }

    // (128:10) {#each Object.entries(headers) as [prop, header] (prop)}
    function create_each_block_1$1(key_1, ctx) {
    	let td;

    	function select_block_type(ctx, dirty) {
    		if (/*prop*/ ctx[11] === "scheduled") return create_if_block_1$3;
    		if (/*prop*/ ctx[11] === "place_bell") return create_if_block_2$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			add_location(td, file$3, 128, 12, 3004);
    			this.first = td;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			if_block.m(td, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(td, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(128:10) {#each Object.entries(headers) as [prop, header] (prop)}",
    		ctx
    	});

    	return block;
    }

    // (139:10) {#if remove}
    function create_if_block$3(ctx) {
    	let td;
    	let a;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			td = element("td");
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "fas fa-minus-circle text-danger");
    			add_location(i, file$3, 140, 79, 3430);
    			attr_dev(a, "class", "delete");
    			attr_dev(a, "href", "#");
    			add_location(a, file$3, 140, 14, 3365);
    			attr_dev(td, "class", "text-right");
    			add_location(td, file$3, 139, 12, 3327);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, a);
    			append_dev(a, i);

    			if (!mounted) {
    				dispose = listen_dev(
    					a,
    					"click",
    					function () {
    						if (is_function(/*triggerDelete*/ ctx[6](/*card*/ ctx[8].method))) /*triggerDelete*/ ctx[6](/*card*/ ctx[8].method).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(139:10) {#if remove}",
    		ctx
    	});

    	return block;
    }

    // (126:6) {#each data as card}
    function create_each_block$1(ctx) {
    	let tr;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t0;
    	let t1;
    	let each_value_1 = Object.entries(/*headers*/ ctx[1]);
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*prop*/ ctx[11];
    	validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
    	}

    	let if_block = /*remove*/ ctx[2] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			add_location(tr, file$3, 126, 8, 2920);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t0);
    			if (if_block) if_block.m(tr, null);
    			append_dev(tr, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*formatDate, data, Object, headers, bellName*/ 35) {
    				const each_value_1 = Object.entries(/*headers*/ ctx[1]);
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, tr, destroy_block, create_each_block_1$1, t0, get_each_context_1$1);
    			}

    			if (/*remove*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(tr, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(126:6) {#each data as card}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t0;
    	let t1;
    	let t2;
    	let tbody;
    	let each_value_2 = Object.entries(/*headers*/ ctx[1]);
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*prop*/ ctx[11];
    	validate_each_keys(ctx, each_value_2, get_each_context_2$1, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2$1(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_2$1(key, child_ctx));
    	}

    	let if_block0 = /*remove*/ ctx[2] && create_if_block_4$1(ctx);
    	let if_block1 = /*data*/ ctx[0].length == 0 && create_if_block_3$1(ctx);
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(tr, file$3, 104, 4, 2346);
    			add_location(thead, file$3, 103, 2, 2334);
    			add_location(tbody, file$3, 124, 2, 2877);
    			attr_dev(table, "class", "table table-sm table-striped border-bottom");
    			add_location(table, file$3, 102, 0, 2273);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(tr, t0);
    			if (if_block0) if_block0.m(tr, null);
    			append_dev(table, t1);
    			if (if_block1) if_block1.m(table, null);
    			append_dev(table, t2);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*sort, Object, headers, sortBy*/ 26) {
    				const each_value_2 = Object.entries(/*headers*/ ctx[1]);
    				validate_each_argument(each_value_2);
    				validate_each_keys(ctx, each_value_2, get_each_context_2$1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_2, each0_lookup, tr, destroy_block, create_each_block_2$1, t0, get_each_context_2$1);
    			}

    			if (/*remove*/ ctx[2]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					if_block0.m(tr, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*data*/ ctx[0].length == 0) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_3$1(ctx);
    					if_block1.c();
    					if_block1.m(table, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*triggerDelete, data, remove, Object, headers, formatDate, bellName*/ 103) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SortableTable", slots, []);
    	dayjs_min.extend(relativeTime);
    	dayjs_min.extend(isSameOrAfter);
    	dayjs_min.extend(isTomorrow);
    	dayjs_min.extend(utc);
    	dayjs_min.extend(timezone);

    	function formatDate(d) {
    		let djs = dayjs_min.tz(d);

    		if (djs.isBefore(dayjs_min().add(1, "days"), "day")) {
    			return "today";
    		} else if (djs.isBefore(dayjs_min().add(2, "days"), "day")) {
    			return "tomorrow";
    		} else {
    			return djs.from(dayjs_min().startOf("day"));
    		}
    	}

    	let { data } = $$props;
    	let { headers } = $$props;
    	let { remove = false } = $$props;

    	// Holds table sort state.  Initialized to reflect table sorted by id column ascending.
    	let sortBy = { col: "scheduled", ascending: false };

    	onMount(() => {
    		sort("scheduled");
    	});

    	const dispatch = createEventDispatcher();

    	function triggerDelete(method_name) {
    		if (confirm("This will delete all cards associated with this method. It cannot be undone. Are you sure you want to proceed?")) {
    			dispatch("delete_method", { method_name });
    		}
    	}

    	
    	const writable_props = ["data", "headers", "remove"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SortableTable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("headers" in $$props) $$invalidate(1, headers = $$props.headers);
    		if ("remove" in $$props) $$invalidate(2, remove = $$props.remove);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		bellName,
    		createEventDispatcher,
    		dayjs: dayjs_min,
    		relativeTime,
    		isSameOrAfter,
    		isTomorrow,
    		Timezone: timezone,
    		utc,
    		formatDate,
    		data,
    		headers,
    		remove,
    		sortBy,
    		dispatch,
    		triggerDelete,
    		sort
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("headers" in $$props) $$invalidate(1, headers = $$props.headers);
    		if ("remove" in $$props) $$invalidate(2, remove = $$props.remove);
    		if ("sortBy" in $$props) $$invalidate(3, sortBy = $$props.sortBy);
    		if ("sort" in $$props) $$invalidate(4, sort = $$props.sort);
    	};

    	let sort;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*sortBy, data*/ 9) {
    			 $$invalidate(4, sort = column => {
    				if (sortBy.col == column) {
    					$$invalidate(3, sortBy.ascending = !sortBy.ascending, sortBy);
    				} else {
    					$$invalidate(3, sortBy.col = column, sortBy);
    					$$invalidate(3, sortBy.ascending = true, sortBy);
    				}

    				// Modifier to sorting function for ascending or descending
    				let sortModifier = sortBy.ascending ? 1 : -1;

    				let sort = (a, b) => a[column] < b[column]
    				? -1 * sortModifier
    				: a[column] > b[column] ? 1 * sortModifier : 0;

    				$$invalidate(0, data = data.sort(sort));
    			});
    		}
    	};

    	return [data, headers, remove, sortBy, sort, formatDate, triggerDelete];
    }

    class SortableTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { data: 0, headers: 1, remove: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SortableTable",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<SortableTable> was created without expected prop 'data'");
    		}

    		if (/*headers*/ ctx[1] === undefined && !("headers" in props)) {
    			console.warn("<SortableTable> was created without expected prop 'headers'");
    		}
    	}

    	get data() {
    		throw new Error("<SortableTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<SortableTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get headers() {
    		throw new Error("<SortableTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headers(value) {
    		throw new Error("<SortableTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<SortableTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<SortableTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/simple-svelte-autocomplete/src/SimpleAutocomplete.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$1, console: console_1$1 } = globals;
    const file$4 = "node_modules/simple-svelte-autocomplete/src/SimpleAutocomplete.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[71] = list[i];
    	child_ctx[73] = i;
    	return child_ctx;
    }

    // (736:2) {#if showClear}
    function create_if_block_6(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "✖";
    			attr_dev(span, "class", "autocomplete-clear-button svelte-17gke0z");
    			add_location(span, file$4, 736, 4, 16809);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*clear*/ ctx[26], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(736:2) {#if showClear}",
    		ctx
    	});

    	return block;
    }

    // (765:28) 
    function create_if_block_5$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*noResultsText*/ ctx[1]);
    			attr_dev(div, "class", "autocomplete-list-item-no-results svelte-17gke0z");
    			add_location(div, file$4, 765, 6, 17937);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*noResultsText*/ 2) set_data_dev(t, /*noResultsText*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(765:28) ",
    		ctx
    	});

    	return block;
    }

    // (743:4) {#if filteredListItems && filteredListItems.length > 0}
    function create_if_block$4(ctx) {
    	let t;
    	let if_block_anchor;
    	let each_value = /*filteredListItems*/ ctx[16];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	let if_block = /*maxItemsToShowInList*/ ctx[0] > 0 && /*filteredListItems*/ ctx[16].length > /*maxItemsToShowInList*/ ctx[0] && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*highlightIndex, onListItemClick, filteredListItems, maxItemsToShowInList*/ 622593) {
    				each_value = /*filteredListItems*/ ctx[16];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*maxItemsToShowInList*/ ctx[0] > 0 && /*filteredListItems*/ ctx[16].length > /*maxItemsToShowInList*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(743:4) {#if filteredListItems && filteredListItems.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (745:8) {#if listItem && (maxItemsToShowInList <= 0 || i < maxItemsToShowInList)}
    function create_if_block_2$4(ctx) {
    	let if_block_anchor;
    	let if_block = /*listItem*/ ctx[71] && create_if_block_3$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*listItem*/ ctx[71]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(745:8) {#if listItem && (maxItemsToShowInList <= 0 || i < maxItemsToShowInList)}",
    		ctx
    	});

    	return block;
    }

    // (746:10) {#if listItem}
    function create_if_block_3$2(ctx) {
    	let div;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*listItem*/ ctx[71].highlighted) return create_if_block_4$2;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[46](/*listItem*/ ctx[71], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();

    			attr_dev(div, "class", div_class_value = "autocomplete-list-item " + (/*i*/ ctx[73] === /*highlightIndex*/ ctx[15]
    			? "selected"
    			: "") + " svelte-17gke0z");

    			add_location(div, file$4, 746, 12, 17264);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty[0] & /*highlightIndex*/ 32768 && div_class_value !== (div_class_value = "autocomplete-list-item " + (/*i*/ ctx[73] === /*highlightIndex*/ ctx[15]
    			? "selected"
    			: "") + " svelte-17gke0z")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(746:10) {#if listItem}",
    		ctx
    	});

    	return block;
    }

    // (752:14) {:else}
    function create_else_block$3(ctx) {
    	let html_tag;
    	let raw_value = /*listItem*/ ctx[71].label + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredListItems*/ 65536 && raw_value !== (raw_value = /*listItem*/ ctx[71].label + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(752:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (750:14) {#if listItem.highlighted}
    function create_if_block_4$2(ctx) {
    	let html_tag;
    	let raw_value = /*listItem*/ ctx[71].highlighted.label + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredListItems*/ 65536 && raw_value !== (raw_value = /*listItem*/ ctx[71].highlighted.label + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(750:14) {#if listItem.highlighted}",
    		ctx
    	});

    	return block;
    }

    // (744:6) {#each filteredListItems as listItem, i}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*listItem*/ ctx[71] && (/*maxItemsToShowInList*/ ctx[0] <= 0 || /*i*/ ctx[73] < /*maxItemsToShowInList*/ ctx[0]) && create_if_block_2$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*listItem*/ ctx[71] && (/*maxItemsToShowInList*/ ctx[0] <= 0 || /*i*/ ctx[73] < /*maxItemsToShowInList*/ ctx[0])) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(744:6) {#each filteredListItems as listItem, i}",
    		ctx
    	});

    	return block;
    }

    // (760:6) {#if maxItemsToShowInList > 0 && filteredListItems.length > maxItemsToShowInList}
    function create_if_block_1$4(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*filteredListItems*/ ctx[16].length - /*maxItemsToShowInList*/ ctx[0] + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("...");
    			t1 = text(t1_value);
    			t2 = text(" results not shown");
    			attr_dev(div, "class", "autocomplete-list-item-no-results svelte-17gke0z");
    			add_location(div, file$4, 760, 8, 17746);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredListItems, maxItemsToShowInList*/ 65537 && t1_value !== (t1_value = /*filteredListItems*/ ctx[16].length - /*maxItemsToShowInList*/ ctx[0] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(760:6) {#if maxItemsToShowInList > 0 && filteredListItems.length > maxItemsToShowInList}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let input_1;
    	let input_1_class_value;
    	let input_1_id_value;
    	let t0;
    	let t1;
    	let div0;
    	let div0_class_value;
    	let div1_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*showClear*/ ctx[9] && create_if_block_6(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*filteredListItems*/ ctx[16] && /*filteredListItems*/ ctx[16].length > 0) return create_if_block$4;
    		if (/*noResultsText*/ ctx[1]) return create_if_block_5$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			input_1 = element("input");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(input_1, "type", "text");

    			attr_dev(input_1, "class", input_1_class_value = "" + ((/*inputClassName*/ ctx[4]
    			? /*inputClassName*/ ctx[4]
    			: "") + " input autocomplete-input" + " svelte-17gke0z"));

    			attr_dev(input_1, "id", input_1_id_value = /*inputId*/ ctx[5] ? /*inputId*/ ctx[5] : "");
    			attr_dev(input_1, "placeholder", /*placeholder*/ ctx[2]);
    			attr_dev(input_1, "name", /*name*/ ctx[6]);
    			input_1.disabled = /*disabled*/ ctx[10];
    			attr_dev(input_1, "title", /*title*/ ctx[11]);
    			add_location(input_1, file$4, 720, 2, 16423);

    			attr_dev(div0, "class", div0_class_value = "" + ((/*dropdownClassName*/ ctx[7]
    			? /*dropdownClassName*/ ctx[7]
    			: "") + " autocomplete-list " + (/*showList*/ ctx[17] ? "" : "hidden") + "\n    is-fullwidth" + " svelte-17gke0z"));

    			add_location(div0, file$4, 738, 2, 16892);
    			attr_dev(div1, "class", div1_class_value = "" + ((/*className*/ ctx[3] ? /*className*/ ctx[3] : "") + "\n  " + (/*hideArrow*/ ctx[8] ? "hide-arrow is-multiple" : "") + "\n  " + (/*showClear*/ ctx[9] ? "show-clear" : "") + " autocomplete select is-fullwidth " + /*uniqueId*/ ctx[18] + " svelte-17gke0z"));
    			add_location(div1, file$4, 716, 0, 16252);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input_1);
    			/*input_1_binding*/ ctx[44](input_1);
    			set_input_value(input_1, /*text*/ ctx[12]);
    			append_dev(div1, t0);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			if (if_block1) if_block1.m(div0, null);
    			/*div0_binding*/ ctx[47](div0);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*onDocumentClick*/ ctx[20], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[45]),
    					listen_dev(input_1, "input", /*onInput*/ ctx[23], false, false, false),
    					listen_dev(input_1, "focus", /*onFocus*/ ctx[25], false, false, false),
    					listen_dev(input_1, "keydown", /*onKeyDown*/ ctx[21], false, false, false),
    					listen_dev(input_1, "click", /*onInputClick*/ ctx[24], false, false, false),
    					listen_dev(input_1, "keypress", /*onKeyPress*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*inputClassName*/ 16 && input_1_class_value !== (input_1_class_value = "" + ((/*inputClassName*/ ctx[4]
    			? /*inputClassName*/ ctx[4]
    			: "") + " input autocomplete-input" + " svelte-17gke0z"))) {
    				attr_dev(input_1, "class", input_1_class_value);
    			}

    			if (dirty[0] & /*inputId*/ 32 && input_1_id_value !== (input_1_id_value = /*inputId*/ ctx[5] ? /*inputId*/ ctx[5] : "")) {
    				attr_dev(input_1, "id", input_1_id_value);
    			}

    			if (dirty[0] & /*placeholder*/ 4) {
    				attr_dev(input_1, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (dirty[0] & /*name*/ 64) {
    				attr_dev(input_1, "name", /*name*/ ctx[6]);
    			}

    			if (dirty[0] & /*disabled*/ 1024) {
    				prop_dev(input_1, "disabled", /*disabled*/ ctx[10]);
    			}

    			if (dirty[0] & /*title*/ 2048) {
    				attr_dev(input_1, "title", /*title*/ ctx[11]);
    			}

    			if (dirty[0] & /*text*/ 4096 && input_1.value !== /*text*/ ctx[12]) {
    				set_input_value(input_1, /*text*/ ctx[12]);
    			}

    			if (/*showClear*/ ctx[9]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(div1, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			}

    			if (dirty[0] & /*dropdownClassName, showList*/ 131200 && div0_class_value !== (div0_class_value = "" + ((/*dropdownClassName*/ ctx[7]
    			? /*dropdownClassName*/ ctx[7]
    			: "") + " autocomplete-list " + (/*showList*/ ctx[17] ? "" : "hidden") + "\n    is-fullwidth" + " svelte-17gke0z"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty[0] & /*className, hideArrow, showClear*/ 776 && div1_class_value !== (div1_class_value = "" + ((/*className*/ ctx[3] ? /*className*/ ctx[3] : "") + "\n  " + (/*hideArrow*/ ctx[8] ? "hide-arrow is-multiple" : "") + "\n  " + (/*showClear*/ ctx[9] ? "show-clear" : "") + " autocomplete select is-fullwidth " + /*uniqueId*/ ctx[18] + " svelte-17gke0z"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*input_1_binding*/ ctx[44](null);
    			if (if_block0) if_block0.d();

    			if (if_block1) {
    				if_block1.d();
    			}

    			/*div0_binding*/ ctx[47](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function safeStringFunction(theFunction, argument) {
    	if (typeof theFunction !== "function") {
    		console.error("Not a function: " + theFunction + ", argument: " + argument);
    	}

    	let originalResult;

    	try {
    		originalResult = theFunction(argument);
    	} catch(error) {
    		console.warn("Error executing Autocomplete function on value: " + argument + " function: " + theFunction);
    	}

    	let result = originalResult;

    	if (result === undefined || result === null) {
    		result = "";
    	}

    	if (typeof result !== "string") {
    		result = result.toString();
    	}

    	return result;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SimpleAutocomplete", slots, []);
    	let { items = [] } = $$props;
    	let { labelFieldName = undefined } = $$props;
    	let { keywordsFieldName = labelFieldName } = $$props;
    	let { valueFieldName = undefined } = $$props;

    	let { labelFunction = function (item) {
    		if (item === undefined || item === null) {
    			return "";
    		}

    		return labelFieldName ? item[labelFieldName] : item;
    	} } = $$props;

    	let { keywordsFunction = function (item) {
    		if (item === undefined || item === null) {
    			return "";
    		}

    		return keywordsFieldName
    		? item[keywordsFieldName]
    		: labelFunction(item);
    	} } = $$props;

    	let { valueFunction = function (item) {
    		if (item === undefined || item === null) {
    			return item;
    		}

    		return valueFieldName ? item[valueFieldName] : item;
    	} } = $$props;

    	let { keywordsCleanFunction = function (keywords) {
    		return keywords;
    	} } = $$props;

    	let { textCleanFunction = function (userEnteredText) {
    		return userEnteredText;
    	} } = $$props;

    	let { searchFunction = false } = $$props;

    	let { beforeChange = function (oldSelectedItem, newSelectedItem) {
    		return true;
    	} } = $$props;

    	let { onChange = function (newSelectedItem) {
    		
    	} } = $$props;

    	let { selectFirstIfEmpty = false } = $$props;
    	let { minCharactersToSearch = 1 } = $$props;
    	let { maxItemsToShowInList = 0 } = $$props;
    	let { noResultsText = "No results found" } = $$props;
    	const uniqueId = "sautocomplete-" + Math.floor(Math.random() * 1000);

    	function safeLabelFunction(item) {
    		// console.log("labelFunction: " + labelFunction);
    		// console.log("safeLabelFunction, item: " + item);
    		return safeStringFunction(labelFunction, item);
    	}

    	function safeKeywordsFunction(item) {
    		// console.log("safeKeywordsFunction");
    		const keywords = safeStringFunction(keywordsFunction, item);

    		let result = safeStringFunction(keywordsCleanFunction, keywords);
    		result = result.toLowerCase().trim();

    		if (debug) {
    			console.log("Extracted keywords: '" + result + "' from item: " + JSON.stringify(item));
    		}

    		return result;
    	}

    	let { placeholder = undefined } = $$props;
    	let { className = undefined } = $$props;
    	let { inputClassName = undefined } = $$props;
    	let { inputId = undefined } = $$props;
    	let { name = undefined } = $$props;
    	let { dropdownClassName = undefined } = $$props;
    	let { hideArrow = false } = $$props;
    	let { showClear = false } = $$props;
    	let { disabled = false } = $$props;
    	let { title = undefined } = $$props;
    	let { debug = false } = $$props;
    	let { selectedItem = undefined } = $$props;
    	let { value = undefined } = $$props;
    	let text;
    	let filteredTextLength = 0;

    	function onSelectedItemChanged() {
    		$$invalidate(29, value = valueFunction(selectedItem));
    		$$invalidate(12, text = safeLabelFunction(selectedItem));
    		onChange(selectedItem);
    	}

    	// HTML elements
    	let input;

    	let list;

    	// UI state
    	let opened = false;

    	let highlightIndex = -1;

    	// view model
    	let filteredListItems;

    	let listItems = [];

    	function prepareListItems() {
    		let tStart;

    		if (debug) {
    			tStart = performance.now();
    			console.log("prepare items to search");
    			console.log("items: " + JSON.stringify(items));
    		}

    		if (!Array.isArray(items)) {
    			console.warn("Autocomplete items / search function did not return array but", items);
    			$$invalidate(27, items = []);
    		}

    		const length = items ? items.length : 0;
    		listItems = new Array(length);

    		if (length > 0) {
    			items.forEach((item, i) => {
    				const listItem = getListItem(item);

    				if (listItem == undefined) {
    					console.log("Undefined item for: ", item);
    				}

    				listItems[i] = listItem;
    			});
    		}

    		if (debug) {
    			const tEnd = performance.now();
    			console.log(listItems.length + " items to search prepared in " + (tEnd - tStart) + " milliseconds");
    		}
    	}

    	function getListItem(item) {
    		return {
    			// keywords representation of the item
    			keywords: safeKeywordsFunction(item),
    			// item label
    			label: safeLabelFunction(item),
    			// store reference to the origial item
    			item
    		};
    	}

    	function prepareUserEnteredText(userEnteredText) {
    		if (userEnteredText === undefined || userEnteredText === null) {
    			return "";
    		}

    		const textFiltered = userEnteredText.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, " ").trim();
    		$$invalidate(48, filteredTextLength = textFiltered.length);

    		if (minCharactersToSearch > 1) {
    			if (filteredTextLength < minCharactersToSearch) {
    				return "";
    			}
    		}

    		const cleanUserEnteredText = textCleanFunction(textFiltered);
    		const textFilteredLowerCase = cleanUserEnteredText.toLowerCase().trim();

    		if (debug) {
    			console.log("Change user entered text '" + userEnteredText + "' into '" + textFilteredLowerCase + "'");
    		}

    		return textFilteredLowerCase;
    	}

    	async function search() {
    		let tStart;

    		if (debug) {
    			tStart = performance.now();
    			console.log("Searching user entered text: '" + text + "'");
    		}

    		const textFiltered = prepareUserEnteredText(text);

    		if (textFiltered === "") {
    			$$invalidate(16, filteredListItems = listItems);
    			closeIfMinCharsToSearchReached();

    			if (debug) {
    				console.log("User entered text is empty set the list of items to all items");
    			}

    			return;
    		}

    		if (searchFunction) {
    			$$invalidate(27, items = await searchFunction(textFiltered));
    			prepareListItems();
    		}

    		const searchWords = textFiltered.split(" ");

    		let tempfilteredListItems = listItems.filter(listItem => {
    			if (!listItem) {
    				return false;
    			}

    			const itemKeywords = listItem.keywords;
    			let matches = 0;

    			searchWords.forEach(searchWord => {
    				if (itemKeywords.includes(searchWord)) {
    					matches++;
    				}
    			});

    			return matches >= searchWords.length;
    		});

    		const hlfilter = highlightFilter(textFiltered, ["label"]);
    		const filteredListItemsHighlighted = tempfilteredListItems.map(hlfilter);
    		$$invalidate(16, filteredListItems = filteredListItemsHighlighted);
    		closeIfMinCharsToSearchReached();

    		if (debug) {
    			const tEnd = performance.now();
    			console.log("Search took " + (tEnd - tStart) + " milliseconds, found " + filteredListItems.length + " items");
    		}
    	}

    	// $: text, search();
    	function selectListItem(listItem) {
    		if (debug) {
    			console.log("selectListItem");
    		}

    		if ("undefined" === typeof listItem) {
    			if (debug) {
    				console.log(`listItem ${i} is undefined. Can not select.`);
    			}

    			return false;
    		}

    		const newSelectedItem = listItem.item;

    		if (beforeChange(selectedItem, newSelectedItem)) {
    			$$invalidate(28, selectedItem = newSelectedItem);
    		}

    		return true;
    	}

    	function selectItem() {
    		if (debug) {
    			console.log("selectItem");
    		}

    		const listItem = filteredListItems[highlightIndex];

    		if (selectListItem(listItem)) {
    			close();
    		}
    	}

    	function up() {
    		if (debug) {
    			console.log("up");
    		}

    		open();
    		if (highlightIndex > 0) $$invalidate(15, highlightIndex--, highlightIndex);
    		highlight();
    	}

    	function down() {
    		if (debug) {
    			console.log("down");
    		}

    		open();
    		if (highlightIndex < filteredListItems.length - 1) $$invalidate(15, highlightIndex++, highlightIndex);
    		highlight();
    	}

    	function highlight() {
    		if (debug) {
    			console.log("highlight");
    		}

    		const query = ".selected";

    		if (debug) {
    			console.log("Seaching DOM element: " + query + " in " + list);
    		}

    		const el = list.querySelector(query);

    		if (el) {
    			if (typeof el.scrollIntoViewIfNeeded === "function") {
    				if (debug) {
    					console.log("Scrolling selected item into view");
    				}

    				el.scrollIntoViewIfNeeded();
    			} else {
    				if (debug) {
    					console.warn("Could not scroll selected item into view, scrollIntoViewIfNeeded not supported");
    				}
    			}
    		} else {
    			if (debug) {
    				console.warn("Selected item not found to scroll into view");
    			}
    		}
    	}

    	function onListItemClick(listItem) {
    		if (debug) {
    			console.log("onListItemClick");
    		}

    		if (selectListItem(listItem)) {
    			close();
    		}
    	}

    	function onDocumentClick(e) {
    		if (debug) {
    			console.log("onDocumentClick: " + JSON.stringify(e.target));
    		}

    		if (e.target.closest("." + uniqueId)) {
    			if (debug) {
    				console.log("onDocumentClick inside");
    			}

    			// resetListToAllItemsAndOpen();
    			highlight();
    		} else {
    			if (debug) {
    				console.log("onDocumentClick outside");
    			}

    			close();
    		}
    	}

    	function onKeyDown(e) {
    		if (debug) {
    			console.log("onKeyDown");
    		}

    		let key = e.key;
    		if (key === "Tab" && e.shiftKey) key = "ShiftTab";

    		const fnmap = {
    			Tab: opened ? down.bind(this) : null,
    			ShiftTab: opened ? up.bind(this) : null,
    			ArrowDown: down.bind(this),
    			ArrowUp: up.bind(this),
    			Escape: onEsc.bind(this)
    		};

    		const fn = fnmap[key];

    		if (typeof fn === "function") {
    			e.preventDefault();
    			fn(e);
    		}
    	}

    	function onKeyPress(e) {
    		if (debug) {
    			console.log("onKeyPress");
    		}

    		if (e.key === "Enter") {
    			e.preventDefault();
    			selectItem();
    		}
    	}

    	function onInput(e) {
    		if (debug) {
    			console.log("onInput");
    		}

    		$$invalidate(12, text = e.target.value);
    		search();
    		$$invalidate(15, highlightIndex = 0);
    		open();
    	}

    	function onInputClick() {
    		if (debug) {
    			console.log("onInputClick");
    		}

    		resetListToAllItemsAndOpen();
    	}

    	function onEsc(e) {
    		if (debug) {
    			console.log("onEsc");
    		}

    		//if (text) return clear();
    		e.stopPropagation();

    		if (opened) {
    			input.focus();
    			close();
    		}
    	}

    	function onFocus() {
    		if (debug) {
    			console.log("onFocus");
    		}

    		resetListToAllItemsAndOpen();
    	}

    	function resetListToAllItemsAndOpen() {
    		if (debug) {
    			console.log("resetListToAllItemsAndOpen");
    		}

    		$$invalidate(16, filteredListItems = listItems);
    		open();

    		// find selected item
    		if (selectedItem) {
    			if (debug) {
    				console.log("Searching currently selected item: " + JSON.stringify(selectedItem));
    			}

    			for (let i = 0; i < listItems.length; i++) {
    				const listItem = listItems[i];

    				if ("undefined" === typeof listItem) {
    					if (debug) {
    						console.log(`listItem ${i} is undefined. Skipping.`);
    					}

    					continue;
    				}

    				if (debug) {
    					console.log("Item " + i + ": " + JSON.stringify(listItem));
    				}

    				if (selectedItem == listItem.item) {
    					$$invalidate(15, highlightIndex = i);

    					if (debug) {
    						console.log("Found selected item: " + i + ": " + JSON.stringify(listItem));
    					}

    					highlight();
    					break;
    				}
    			}
    		}
    	}

    	function open() {
    		if (debug) {
    			console.log("open");
    		}

    		// check if the search text has more than the min chars required
    		if (isMinCharsToSearchReached()) {
    			return;
    		}

    		$$invalidate(49, opened = true);
    	}

    	function close() {
    		if (debug) {
    			console.log("close");
    		}

    		$$invalidate(49, opened = false);

    		if (!text && selectFirstIfEmpty) {
    			highlightFilter = 0;
    			selectItem();
    		}
    	}

    	function isMinCharsToSearchReached() {
    		return minCharactersToSearch > 1 && filteredTextLength < minCharactersToSearch;
    	}

    	function closeIfMinCharsToSearchReached() {
    		if (isMinCharsToSearchReached()) {
    			close();
    		}
    	}

    	function clear() {
    		if (debug) {
    			console.log("clear");
    		}

    		$$invalidate(12, text = "");
    		$$invalidate(28, selectedItem = undefined);

    		setTimeout(() => {
    			input.focus();
    			close();
    		});
    	}

    	function onBlur() {
    		if (debug) {
    			console.log("onBlur");
    		}

    		close();
    	}

    	// 'item number one'.replace(/(it)(.*)(nu)(.*)(one)/ig, '<b>$1</b>$2 <b>$3</b>$4 <b>$5</b>')
    	function highlightFilter(q, fields) {
    		const qs = "(" + q.trim().replace(/\s/g, ")(.*)(") + ")";
    		const reg = new RegExp(qs, "ig");
    		let n = 1;
    		const len = qs.split(")(").length + 1;
    		let repl = "";
    		for (; n < len; n++) repl += n % 2 ? `<b>$${n}</b>` : `$${n}`;

    		return i => {
    			const newI = Object.assign({ highlighted: {} }, i);

    			if (fields) {
    				fields.forEach(f => {
    					if (!newI[f]) return;
    					newI.highlighted[f] = newI[f].replace(reg, repl);
    				});
    			}

    			return newI;
    		};
    	}

    	const writable_props = [
    		"items",
    		"labelFieldName",
    		"keywordsFieldName",
    		"valueFieldName",
    		"labelFunction",
    		"keywordsFunction",
    		"valueFunction",
    		"keywordsCleanFunction",
    		"textCleanFunction",
    		"searchFunction",
    		"beforeChange",
    		"onChange",
    		"selectFirstIfEmpty",
    		"minCharactersToSearch",
    		"maxItemsToShowInList",
    		"noResultsText",
    		"placeholder",
    		"className",
    		"inputClassName",
    		"inputId",
    		"name",
    		"dropdownClassName",
    		"hideArrow",
    		"showClear",
    		"disabled",
    		"title",
    		"debug",
    		"selectedItem",
    		"value"
    	];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<SimpleAutocomplete> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(13, input);
    		});
    	}

    	function input_1_input_handler() {
    		text = this.value;
    		$$invalidate(12, text);
    	}

    	const click_handler = listItem => onListItemClick(listItem);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			list = $$value;
    			$$invalidate(14, list);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(27, items = $$props.items);
    		if ("labelFieldName" in $$props) $$invalidate(30, labelFieldName = $$props.labelFieldName);
    		if ("keywordsFieldName" in $$props) $$invalidate(31, keywordsFieldName = $$props.keywordsFieldName);
    		if ("valueFieldName" in $$props) $$invalidate(32, valueFieldName = $$props.valueFieldName);
    		if ("labelFunction" in $$props) $$invalidate(33, labelFunction = $$props.labelFunction);
    		if ("keywordsFunction" in $$props) $$invalidate(34, keywordsFunction = $$props.keywordsFunction);
    		if ("valueFunction" in $$props) $$invalidate(35, valueFunction = $$props.valueFunction);
    		if ("keywordsCleanFunction" in $$props) $$invalidate(36, keywordsCleanFunction = $$props.keywordsCleanFunction);
    		if ("textCleanFunction" in $$props) $$invalidate(37, textCleanFunction = $$props.textCleanFunction);
    		if ("searchFunction" in $$props) $$invalidate(38, searchFunction = $$props.searchFunction);
    		if ("beforeChange" in $$props) $$invalidate(39, beforeChange = $$props.beforeChange);
    		if ("onChange" in $$props) $$invalidate(40, onChange = $$props.onChange);
    		if ("selectFirstIfEmpty" in $$props) $$invalidate(41, selectFirstIfEmpty = $$props.selectFirstIfEmpty);
    		if ("minCharactersToSearch" in $$props) $$invalidate(42, minCharactersToSearch = $$props.minCharactersToSearch);
    		if ("maxItemsToShowInList" in $$props) $$invalidate(0, maxItemsToShowInList = $$props.maxItemsToShowInList);
    		if ("noResultsText" in $$props) $$invalidate(1, noResultsText = $$props.noResultsText);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("className" in $$props) $$invalidate(3, className = $$props.className);
    		if ("inputClassName" in $$props) $$invalidate(4, inputClassName = $$props.inputClassName);
    		if ("inputId" in $$props) $$invalidate(5, inputId = $$props.inputId);
    		if ("name" in $$props) $$invalidate(6, name = $$props.name);
    		if ("dropdownClassName" in $$props) $$invalidate(7, dropdownClassName = $$props.dropdownClassName);
    		if ("hideArrow" in $$props) $$invalidate(8, hideArrow = $$props.hideArrow);
    		if ("showClear" in $$props) $$invalidate(9, showClear = $$props.showClear);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$props.disabled);
    		if ("title" in $$props) $$invalidate(11, title = $$props.title);
    		if ("debug" in $$props) $$invalidate(43, debug = $$props.debug);
    		if ("selectedItem" in $$props) $$invalidate(28, selectedItem = $$props.selectedItem);
    		if ("value" in $$props) $$invalidate(29, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		items,
    		labelFieldName,
    		keywordsFieldName,
    		valueFieldName,
    		labelFunction,
    		keywordsFunction,
    		valueFunction,
    		keywordsCleanFunction,
    		textCleanFunction,
    		searchFunction,
    		beforeChange,
    		onChange,
    		selectFirstIfEmpty,
    		minCharactersToSearch,
    		maxItemsToShowInList,
    		noResultsText,
    		uniqueId,
    		safeStringFunction,
    		safeLabelFunction,
    		safeKeywordsFunction,
    		placeholder,
    		className,
    		inputClassName,
    		inputId,
    		name,
    		dropdownClassName,
    		hideArrow,
    		showClear,
    		disabled,
    		title,
    		debug,
    		selectedItem,
    		value,
    		text,
    		filteredTextLength,
    		onSelectedItemChanged,
    		input,
    		list,
    		opened,
    		highlightIndex,
    		filteredListItems,
    		listItems,
    		prepareListItems,
    		getListItem,
    		prepareUserEnteredText,
    		search,
    		selectListItem,
    		selectItem,
    		up,
    		down,
    		highlight,
    		onListItemClick,
    		onDocumentClick,
    		onKeyDown,
    		onKeyPress,
    		onInput,
    		onInputClick,
    		onEsc,
    		onFocus,
    		resetListToAllItemsAndOpen,
    		open,
    		close,
    		isMinCharsToSearchReached,
    		closeIfMinCharsToSearchReached,
    		clear,
    		onBlur,
    		highlightFilter,
    		showList
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(27, items = $$props.items);
    		if ("labelFieldName" in $$props) $$invalidate(30, labelFieldName = $$props.labelFieldName);
    		if ("keywordsFieldName" in $$props) $$invalidate(31, keywordsFieldName = $$props.keywordsFieldName);
    		if ("valueFieldName" in $$props) $$invalidate(32, valueFieldName = $$props.valueFieldName);
    		if ("labelFunction" in $$props) $$invalidate(33, labelFunction = $$props.labelFunction);
    		if ("keywordsFunction" in $$props) $$invalidate(34, keywordsFunction = $$props.keywordsFunction);
    		if ("valueFunction" in $$props) $$invalidate(35, valueFunction = $$props.valueFunction);
    		if ("keywordsCleanFunction" in $$props) $$invalidate(36, keywordsCleanFunction = $$props.keywordsCleanFunction);
    		if ("textCleanFunction" in $$props) $$invalidate(37, textCleanFunction = $$props.textCleanFunction);
    		if ("searchFunction" in $$props) $$invalidate(38, searchFunction = $$props.searchFunction);
    		if ("beforeChange" in $$props) $$invalidate(39, beforeChange = $$props.beforeChange);
    		if ("onChange" in $$props) $$invalidate(40, onChange = $$props.onChange);
    		if ("selectFirstIfEmpty" in $$props) $$invalidate(41, selectFirstIfEmpty = $$props.selectFirstIfEmpty);
    		if ("minCharactersToSearch" in $$props) $$invalidate(42, minCharactersToSearch = $$props.minCharactersToSearch);
    		if ("maxItemsToShowInList" in $$props) $$invalidate(0, maxItemsToShowInList = $$props.maxItemsToShowInList);
    		if ("noResultsText" in $$props) $$invalidate(1, noResultsText = $$props.noResultsText);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("className" in $$props) $$invalidate(3, className = $$props.className);
    		if ("inputClassName" in $$props) $$invalidate(4, inputClassName = $$props.inputClassName);
    		if ("inputId" in $$props) $$invalidate(5, inputId = $$props.inputId);
    		if ("name" in $$props) $$invalidate(6, name = $$props.name);
    		if ("dropdownClassName" in $$props) $$invalidate(7, dropdownClassName = $$props.dropdownClassName);
    		if ("hideArrow" in $$props) $$invalidate(8, hideArrow = $$props.hideArrow);
    		if ("showClear" in $$props) $$invalidate(9, showClear = $$props.showClear);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$props.disabled);
    		if ("title" in $$props) $$invalidate(11, title = $$props.title);
    		if ("debug" in $$props) $$invalidate(43, debug = $$props.debug);
    		if ("selectedItem" in $$props) $$invalidate(28, selectedItem = $$props.selectedItem);
    		if ("value" in $$props) $$invalidate(29, value = $$props.value);
    		if ("text" in $$props) $$invalidate(12, text = $$props.text);
    		if ("filteredTextLength" in $$props) $$invalidate(48, filteredTextLength = $$props.filteredTextLength);
    		if ("input" in $$props) $$invalidate(13, input = $$props.input);
    		if ("list" in $$props) $$invalidate(14, list = $$props.list);
    		if ("opened" in $$props) $$invalidate(49, opened = $$props.opened);
    		if ("highlightIndex" in $$props) $$invalidate(15, highlightIndex = $$props.highlightIndex);
    		if ("filteredListItems" in $$props) $$invalidate(16, filteredListItems = $$props.filteredListItems);
    		if ("listItems" in $$props) listItems = $$props.listItems;
    		if ("showList" in $$props) $$invalidate(17, showList = $$props.showList);
    	};

    	let showList;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*selectedItem*/ 268435456) {
    			 (onSelectedItemChanged());
    		}

    		if ($$self.$$.dirty[0] & /*items*/ 134217728 | $$self.$$.dirty[1] & /*opened, filteredTextLength*/ 393216) {
    			 $$invalidate(17, showList = opened && (items && items.length > 0 || filteredTextLength > 0));
    		}

    		if ($$self.$$.dirty[0] & /*items*/ 134217728) {
    			 (prepareListItems());
    		}
    	};

    	return [
    		maxItemsToShowInList,
    		noResultsText,
    		placeholder,
    		className,
    		inputClassName,
    		inputId,
    		name,
    		dropdownClassName,
    		hideArrow,
    		showClear,
    		disabled,
    		title,
    		text,
    		input,
    		list,
    		highlightIndex,
    		filteredListItems,
    		showList,
    		uniqueId,
    		onListItemClick,
    		onDocumentClick,
    		onKeyDown,
    		onKeyPress,
    		onInput,
    		onInputClick,
    		onFocus,
    		clear,
    		items,
    		selectedItem,
    		value,
    		labelFieldName,
    		keywordsFieldName,
    		valueFieldName,
    		labelFunction,
    		keywordsFunction,
    		valueFunction,
    		keywordsCleanFunction,
    		textCleanFunction,
    		searchFunction,
    		beforeChange,
    		onChange,
    		selectFirstIfEmpty,
    		minCharactersToSearch,
    		debug,
    		input_1_binding,
    		input_1_input_handler,
    		click_handler,
    		div0_binding
    	];
    }

    class SimpleAutocomplete extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$5,
    			create_fragment$5,
    			safe_not_equal,
    			{
    				items: 27,
    				labelFieldName: 30,
    				keywordsFieldName: 31,
    				valueFieldName: 32,
    				labelFunction: 33,
    				keywordsFunction: 34,
    				valueFunction: 35,
    				keywordsCleanFunction: 36,
    				textCleanFunction: 37,
    				searchFunction: 38,
    				beforeChange: 39,
    				onChange: 40,
    				selectFirstIfEmpty: 41,
    				minCharactersToSearch: 42,
    				maxItemsToShowInList: 0,
    				noResultsText: 1,
    				placeholder: 2,
    				className: 3,
    				inputClassName: 4,
    				inputId: 5,
    				name: 6,
    				dropdownClassName: 7,
    				hideArrow: 8,
    				showClear: 9,
    				disabled: 10,
    				title: 11,
    				debug: 43,
    				selectedItem: 28,
    				value: 29
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SimpleAutocomplete",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get items() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelFieldName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelFieldName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keywordsFieldName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keywordsFieldName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valueFieldName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valueFieldName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keywordsFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keywordsFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valueFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valueFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keywordsCleanFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keywordsCleanFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textCleanFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textCleanFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get beforeChange() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beforeChange(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onChange() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onChange(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectFirstIfEmpty() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectFirstIfEmpty(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minCharactersToSearch() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minCharactersToSearch(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxItemsToShowInList() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxItemsToShowInList(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noResultsText() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noResultsText(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClassName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClassName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputId() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputId(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dropdownClassName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dropdownClassName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideArrow() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideArrow(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showClear() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showClear(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get debug() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set debug(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedItem() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedItem(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/MethodAdder.svelte generated by Svelte v3.29.4 */
    const file$5 = "src/MethodAdder.svelte";

    function create_fragment$6(ctx) {
    	let form_1;
    	let autocomplete;
    	let updating_selectedItem;
    	let updating_value;
    	let t0;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	function autocomplete_selectedItem_binding(value) {
    		/*autocomplete_selectedItem_binding*/ ctx[5].call(null, value);
    	}

    	function autocomplete_value_binding(value) {
    		/*autocomplete_value_binding*/ ctx[6].call(null, value);
    	}

    	let autocomplete_props = {
    		searchFunction: /*getMethods*/ ctx[3],
    		labelFieldName: "method_name",
    		valueFieldName: "method_name",
    		minCharactersToSearch: "3",
    		placeholder: "Add method...",
    		hideArrow: true,
    		className: "form-group special-wtf",
    		inputClassName: "form-control"
    	};

    	if (/*selected*/ ctx[1] !== void 0) {
    		autocomplete_props.selectedItem = /*selected*/ ctx[1];
    	}

    	if (/*input*/ ctx[0] !== void 0) {
    		autocomplete_props.value = /*input*/ ctx[0];
    	}

    	autocomplete = new SimpleAutocomplete({
    			props: autocomplete_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(autocomplete, "selectedItem", autocomplete_selectedItem_binding));
    	binding_callbacks.push(() => bind(autocomplete, "value", autocomplete_value_binding));

    	const block = {
    		c: function create() {
    			form_1 = element("form");
    			create_component(autocomplete.$$.fragment);
    			t0 = space();
    			button = element("button");
    			button.textContent = "Add";
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "btn btn-primary svelte-1tlw235");
    			add_location(button, file$5, 49, 4, 1260);
    			attr_dev(form_1, "id", "addMethodForm");
    			attr_dev(form_1, "class", "form mt-5");
    			add_location(form_1, file$5, 35, 0, 708);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form_1, anchor);
    			mount_component(autocomplete, form_1, null);
    			append_dev(form_1, t0);
    			append_dev(form_1, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*keyDownHandler*/ ctx[4], false, false, false),
    					listen_dev(form_1, "submit", prevent_default(/*addMethod*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const autocomplete_changes = {};

    			if (!updating_selectedItem && dirty & /*selected*/ 2) {
    				updating_selectedItem = true;
    				autocomplete_changes.selectedItem = /*selected*/ ctx[1];
    				add_flush_callback(() => updating_selectedItem = false);
    			}

    			if (!updating_value && dirty & /*input*/ 1) {
    				updating_value = true;
    				autocomplete_changes.value = /*input*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			autocomplete.$set(autocomplete_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(autocomplete.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(autocomplete.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form_1);
    			destroy_component(autocomplete);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MethodAdder", slots, []);
    	let input;
    	let selected;
    	let form;
    	const dispatch = createEventDispatcher();

    	async function addMethod() {
    		return await post("user/methods", { method_name: input }).then(() => dispatch("refresh"));
    	}

    	

    	async function getMethods(keyword) {
    		const promise = await post("methods", { keyword });
    		const json = await promise.results;
    		return json;
    	}

    	function keyDownHandler(e) {
    		if (e.key === "Enter" && input) {
    			addMethod();
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MethodAdder> was created with unknown prop '${key}'`);
    	});

    	function autocomplete_selectedItem_binding(value) {
    		selected = value;
    		$$invalidate(1, selected);
    	}

    	function autocomplete_value_binding(value) {
    		input = value;
    		$$invalidate(0, input);
    	}

    	$$self.$capture_state = () => ({
    		get,
    		post,
    		createEventDispatcher,
    		AutoComplete: SimpleAutocomplete,
    		input,
    		selected,
    		form,
    		dispatch,
    		addMethod,
    		getMethods,
    		keyDownHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("input" in $$props) $$invalidate(0, input = $$props.input);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("form" in $$props) form = $$props.form;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		input,
    		selected,
    		addMethod,
    		getMethods,
    		keyDownHandler,
    		autocomplete_selectedItem_binding,
    		autocomplete_value_binding
    	];
    }

    class MethodAdder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MethodAdder",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/CardManager.svelte generated by Svelte v3.29.4 */

    const { console: console_1$2 } = globals;
    const file$6 = "src/CardManager.svelte";

    // (1:0) <script>   import { get, post, httpDel }
    function create_catch_block_1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(1:0) <script>   import { get, post, httpDel }",
    		ctx
    	});

    	return block;
    }

    // (122:53)                <SortableTable data={all_methods}
    function create_then_block_1(ctx) {
    	let sortabletable;
    	let current;

    	sortabletable = new SortableTable({
    			props: {
    				data: /*all_methods*/ ctx[24],
    				headers: /*method_headers*/ ctx[12],
    				remove: true
    			},
    			$$inline: true
    		});

    	sortabletable.$on("delete_method", /*deleteMethod*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(sortabletable.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sortabletable, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sortabletable_changes = {};
    			if (dirty & /*methods_promise*/ 64) sortabletable_changes.data = /*all_methods*/ ctx[24];
    			sortabletable.$set(sortabletable_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sortabletable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sortabletable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sortabletable, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(122:53)                <SortableTable data={all_methods}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import { get, post, httpDel }
    function create_pending_block_1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(1:0) <script>   import { get, post, httpDel }",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import { get, post, httpDel }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>   import { get, post, httpDel }",
    		ctx
    	});

    	return block;
    }

    // (132:49)                <SortableTable data={all_cards}
    function create_then_block(ctx) {
    	let sortabletable;
    	let current;

    	sortabletable = new SortableTable({
    			props: {
    				data: /*all_cards*/ ctx[23],
    				headers: /*card_headers*/ ctx[11]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sortabletable.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sortabletable, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sortabletable_changes = {};
    			if (dirty & /*cards_promise*/ 32) sortabletable_changes.data = /*all_cards*/ ctx[23];
    			sortabletable.$set(sortabletable_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sortabletable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sortabletable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sortabletable, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(132:49)                <SortableTable data={all_cards}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import { get, post, httpDel }
    function create_pending_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>   import { get, post, httpDel }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div26;
    	let div25;
    	let div24;
    	let div0;
    	let h3;
    	let t1;
    	let ul;
    	let li0;
    	let a0;
    	let t3;
    	let li1;
    	let a1;
    	let t5;
    	let li2;
    	let a2;
    	let t7;
    	let div22;
    	let div21;
    	let div1;
    	let promise;
    	let t8;
    	let methodadder;
    	let t9;
    	let div2;
    	let promise_1;
    	let t10;
    	let div20;
    	let form;
    	let div7;
    	let div3;
    	let label0;
    	let t12;
    	let div4;
    	let input0;
    	let input0_value_value;
    	let t13;
    	let div5;
    	let button0;
    	let t15;
    	let div6;
    	let small0;
    	let t16;
    	let a3;
    	let t18;
    	let t19;
    	let div13;
    	let div8;
    	let label1;
    	let t21;
    	let div9;
    	let input1;
    	let t22;
    	let div11;
    	let div10;
    	let input2;
    	let t23;
    	let label2;
    	let t25;
    	let div12;
    	let small1;
    	let t27;
    	let div19;
    	let div14;
    	let label3;
    	let t29;
    	let div15;
    	let input3;
    	let t30;
    	let div17;
    	let div16;
    	let input4;
    	let t31;
    	let label4;
    	let t33;
    	let div18;
    	let small2;
    	let t35;
    	let div23;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block_1,
    		value: 24,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*methods_promise*/ ctx[6], info);
    	methodadder = new MethodAdder({ $$inline: true });
    	methodadder.$on("refresh", /*refresh*/ ctx[10]);

    	let info_1 = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 23,
    		blocks: [,,,]
    	};

    	handle_promise(promise_1 = /*cards_promise*/ ctx[5], info_1);

    	const block = {
    		c: function create() {
    			div26 = element("div");
    			div25 = element("div");
    			div24 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Method Tutor";
    			t1 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Methods";
    			t3 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Cards";
    			t5 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Settings";
    			t7 = space();
    			div22 = element("div");
    			div21 = element("div");
    			div1 = element("div");
    			info.block.c();
    			t8 = space();
    			create_component(methodadder.$$.fragment);
    			t9 = space();
    			div2 = element("div");
    			info_1.block.c();
    			t10 = space();
    			div20 = element("div");
    			form = element("form");
    			div7 = element("div");
    			div3 = element("div");
    			label0 = element("label");
    			label0.textContent = "Currently logged in as:";
    			t12 = space();
    			div4 = element("div");
    			input0 = element("input");
    			t13 = space();
    			div5 = element("div");
    			button0 = element("button");
    			button0.textContent = "Log Out";
    			t15 = space();
    			div6 = element("div");
    			small0 = element("small");
    			t16 = text("You can change your password on ");
    			a3 = element("a");
    			a3.textContent = "Ringing Room";
    			t18 = text(".");
    			t19 = space();
    			div13 = element("div");
    			div8 = element("div");
    			label1 = element("label");
    			label1.textContent = "Maximum reviews per day:";
    			t21 = space();
    			div9 = element("div");
    			input1 = element("input");
    			t22 = space();
    			div11 = element("div");
    			div10 = element("div");
    			input2 = element("input");
    			t23 = space();
    			label2 = element("label");
    			label2.textContent = "Unlimited";
    			t25 = space();
    			div12 = element("div");
    			small1 = element("small");
    			small1.textContent = "This is the maximum number of unique cards you'll review in a day. (Default: unlimited)";
    			t27 = space();
    			div19 = element("div");
    			div14 = element("div");
    			label3 = element("label");
    			label3.textContent = "Maximum new cards per day:";
    			t29 = space();
    			div15 = element("div");
    			input3 = element("input");
    			t30 = space();
    			div17 = element("div");
    			div16 = element("div");
    			input4 = element("input");
    			t31 = space();
    			label4 = element("label");
    			label4.textContent = "Unlimited";
    			t33 = space();
    			div18 = element("div");
    			small2 = element("small");
    			small2.textContent = "This is the maximum number of new cards that will be shown to you on a given day. (Default: 2)";
    			t35 = space();
    			div23 = element("div");
    			button1 = element("button");
    			button1.textContent = "Close";
    			attr_dev(h3, "class", "modal-title");
    			add_location(h3, file$6, 97, 8, 2177);
    			attr_dev(a0, "class", "nav-link active");
    			attr_dev(a0, "href", "#tabpanel-methods");
    			attr_dev(a0, "id", "tab-methods");
    			attr_dev(a0, "data-toggle", "pill");
    			attr_dev(a0, "role", "tab");
    			attr_dev(a0, "aria-controls", "methods");
    			attr_dev(a0, "aria-selected", "true");
    			add_location(a0, file$6, 101, 12, 2320);
    			attr_dev(li0, "class", "nav-item");
    			attr_dev(li0, "role", "presentation");
    			add_location(li0, file$6, 100, 10, 2266);
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "href", "#tabpanel-cards");
    			attr_dev(a1, "id", "tab-cards");
    			attr_dev(a1, "data-toggle", "pill");
    			attr_dev(a1, "role", "tab");
    			attr_dev(a1, "aria-controls", "cards");
    			attr_dev(a1, "aria-selected", "false");
    			add_location(a1, file$6, 104, 12, 2610);
    			attr_dev(li1, "class", "nav-item");
    			attr_dev(li1, "role", "presentation");
    			add_location(li1, file$6, 103, 10, 2556);
    			attr_dev(a2, "class", "nav-link");
    			attr_dev(a2, "href", "#tabpanel-settings");
    			attr_dev(a2, "id", "tab-settings");
    			attr_dev(a2, "data-toggle", "pill");
    			attr_dev(a2, "role", "tab");
    			attr_dev(a2, "aria-controls", "settings");
    			attr_dev(a2, "aria-selected", "false");
    			add_location(a2, file$6, 107, 12, 2868);
    			attr_dev(li2, "class", "nav-item");
    			attr_dev(li2, "role", "presentation");
    			add_location(li2, file$6, 106, 10, 2814);
    			attr_dev(ul, "class", "nav nav-pills");
    			add_location(ul, file$6, 99, 8, 2229);
    			attr_dev(div0, "class", "modal-header border-bottom-0");
    			add_location(div0, file$6, 95, 6, 2125);
    			attr_dev(div1, "class", "tab-pane fade show active");
    			attr_dev(div1, "id", "tabpanel-methods");
    			attr_dev(div1, "role", "tabpanel");
    			attr_dev(div1, "aria-labelledby", "tab-methods");
    			add_location(div1, file$6, 120, 10, 3241);
    			attr_dev(div2, "class", "tab-pane fade");
    			attr_dev(div2, "id", "tabpanel-cards");
    			attr_dev(div2, "role", "tabpanel");
    			attr_dev(div2, "aria-labelledby", "tab-cards");
    			add_location(div2, file$6, 130, 10, 3645);
    			attr_dev(label0, "for", "user_email");
    			attr_dev(label0, "class", "pr-5 mb-0 mt-1 font-weight-bold");
    			add_location(label0, file$6, 145, 18, 4140);
    			attr_dev(div3, "class", "col-12 col-lg-5");
    			add_location(div3, file$6, 143, 16, 4091);
    			attr_dev(input0, "type", "text");
    			input0.readOnly = true;
    			attr_dev(input0, "id", "user_email");
    			input0.value = input0_value_value = window.user_email;
    			attr_dev(input0, "class", "align-baseline form-control-plaintext mt-n1");
    			add_location(input0, file$6, 153, 18, 4368);
    			attr_dev(div4, "class", "col-auto col-lg-2");
    			add_location(div4, file$6, 151, 16, 4317);
    			attr_dev(button0, "class", "btn btn-sm btn-danger");
    			add_location(button0, file$6, 161, 18, 4640);
    			attr_dev(div5, "class", "col-2 text-right p-0");
    			add_location(div5, file$6, 159, 16, 4586);
    			attr_dev(a3, "href", "https://ringingroom.co.uk");
    			add_location(a3, file$6, 168, 52, 4923);
    			attr_dev(small0, "class", "form-text text-muted");
    			add_location(small0, file$6, 167, 18, 4834);
    			attr_dev(div6, "class", "col-12");
    			add_location(div6, file$6, 166, 16, 4795);
    			attr_dev(div7, "class", "form-row mb-4");
    			add_location(div7, file$6, 140, 14, 4045);
    			attr_dev(label1, "for", "maxReviews");
    			attr_dev(label1, "class", "pr-5 font-weight-bold");
    			add_location(label1, file$6, 180, 18, 5170);
    			attr_dev(div8, "class", "col-12 col-lg-5 mb-0 mt-1");
    			add_location(div8, file$6, 178, 16, 5111);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "id", "maxReviews");
    			input1.disabled = /*unlimited_reviews*/ ctx[1];
    			attr_dev(input1, "class", "align-baseline form-control form-control-sm");
    			add_location(input1, file$6, 188, 18, 5377);
    			attr_dev(div9, "class", "col-2");
    			add_location(div9, file$6, 186, 16, 5338);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "class", "custom-control-input");
    			attr_dev(input2, "id", "maxReviewsUnlimited");
    			add_location(input2, file$6, 200, 20, 5797);
    			attr_dev(label2, "class", "custom-control-label");
    			attr_dev(label2, "for", "maxReviewsUnlimited");
    			add_location(label2, file$6, 204, 20, 6008);
    			attr_dev(div10, "class", "custom-control custom-checkbox pl-5");
    			add_location(div10, file$6, 198, 18, 5726);
    			attr_dev(div11, "class", "col-2");
    			add_location(div11, file$6, 196, 16, 5687);
    			attr_dev(small1, "class", "form-text text-muted");
    			add_location(small1, file$6, 213, 18, 6238);
    			attr_dev(div12, "class", "col-12");
    			add_location(div12, file$6, 212, 16, 6199);
    			attr_dev(div13, "class", "form-row mb-4");
    			add_location(div13, file$6, 175, 14, 5065);
    			attr_dev(label3, "for", "maxNew");
    			attr_dev(label3, "class", "pr-5 font-weight-bold");
    			add_location(label3, file$6, 226, 18, 6576);
    			attr_dev(div14, "class", "col-12 col-lg-5 mb-0 mt-1");
    			add_location(div14, file$6, 224, 16, 6517);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "id", "maxNew");
    			input3.disabled = /*unlimited_new*/ ctx[2];
    			attr_dev(input3, "class", "align-baseline form-control form-control-sm");
    			add_location(input3, file$6, 234, 18, 6781);
    			attr_dev(div15, "class", "col-2");
    			add_location(div15, file$6, 232, 16, 6742);
    			attr_dev(input4, "type", "checkbox");
    			attr_dev(input4, "class", "custom-control-input");
    			attr_dev(input4, "id", "maxNewUnlimited");
    			add_location(input4, file$6, 246, 20, 7189);
    			attr_dev(label4, "class", "custom-control-label");
    			attr_dev(label4, "for", "maxNewUnlimited");
    			add_location(label4, file$6, 250, 20, 7392);
    			attr_dev(div16, "class", "custom-control custom-checkbox pl-5");
    			add_location(div16, file$6, 244, 18, 7118);
    			attr_dev(div17, "class", "col-2");
    			add_location(div17, file$6, 242, 16, 7079);
    			attr_dev(small2, "class", "form-text text-muted");
    			add_location(small2, file$6, 259, 18, 7618);
    			attr_dev(div18, "class", "col-12");
    			add_location(div18, file$6, 258, 16, 7579);
    			attr_dev(div19, "class", "form-row mb-4");
    			add_location(div19, file$6, 221, 14, 6471);
    			add_location(form, file$6, 138, 12, 4023);
    			attr_dev(div20, "class", "tab-pane fade px-3");
    			attr_dev(div20, "id", "tabpanel-settings");
    			attr_dev(div20, "role", "tabpanel");
    			attr_dev(div20, "aria-labelledby", "tab-settings");
    			add_location(div20, file$6, 136, 10, 3907);
    			attr_dev(div21, "class", "tab-content");
    			attr_dev(div21, "id", "tabContent");
    			add_location(div21, file$6, 118, 8, 3188);
    			attr_dev(div22, "class", "modal-body svelte-t9rvop");
    			toggle_class(div22, "overflow-visible", /*modal_overflow*/ ctx[0]);
    			add_location(div22, file$6, 115, 6, 3111);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-secondary");
    			attr_dev(button1, "data-dismiss", "modal");
    			add_location(button1, file$6, 280, 8, 7958);
    			attr_dev(div23, "class", "modal-footer");
    			add_location(div23, file$6, 279, 6, 7923);
    			attr_dev(div24, "class", "modal-content svelte-t9rvop");
    			toggle_class(div24, "overflow-visible", /*modal_overflow*/ ctx[0]);
    			add_location(div24, file$6, 94, 4, 2049);
    			attr_dev(div25, "class", "modal-dialog modal-dialog-scrollable modal-lg svelte-t9rvop");
    			toggle_class(div25, "overflow-visible", /*modal_overflow*/ ctx[0]);
    			add_location(div25, file$6, 93, 2, 1943);
    			attr_dev(div26, "class", "modal fade svelte-t9rvop");
    			attr_dev(div26, "tabindex", "-1");
    			attr_dev(div26, "id", "cardManager");
    			toggle_class(div26, "overflow-visible", /*modal_overflow*/ ctx[0]);
    			add_location(div26, file$6, 92, 0, 1843);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div26, anchor);
    			append_dev(div26, div25);
    			append_dev(div25, div24);
    			append_dev(div24, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t1);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t5);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(div24, t7);
    			append_dev(div24, div22);
    			append_dev(div22, div21);
    			append_dev(div21, div1);
    			info.block.m(div1, info.anchor = null);
    			info.mount = () => div1;
    			info.anchor = t8;
    			append_dev(div1, t8);
    			mount_component(methodadder, div1, null);
    			append_dev(div21, t9);
    			append_dev(div21, div2);
    			info_1.block.m(div2, info_1.anchor = null);
    			info_1.mount = () => div2;
    			info_1.anchor = null;
    			append_dev(div21, t10);
    			append_dev(div21, div20);
    			append_dev(div20, form);
    			append_dev(form, div7);
    			append_dev(div7, div3);
    			append_dev(div3, label0);
    			append_dev(div7, t12);
    			append_dev(div7, div4);
    			append_dev(div4, input0);
    			append_dev(div7, t13);
    			append_dev(div7, div5);
    			append_dev(div5, button0);
    			append_dev(div7, t15);
    			append_dev(div7, div6);
    			append_dev(div6, small0);
    			append_dev(small0, t16);
    			append_dev(small0, a3);
    			append_dev(small0, t18);
    			append_dev(form, t19);
    			append_dev(form, div13);
    			append_dev(div13, div8);
    			append_dev(div8, label1);
    			append_dev(div13, t21);
    			append_dev(div13, div9);
    			append_dev(div9, input1);
    			set_input_value(input1, /*max_reviews*/ ctx[3]);
    			append_dev(div13, t22);
    			append_dev(div13, div11);
    			append_dev(div11, div10);
    			append_dev(div10, input2);
    			input2.checked = /*unlimited_reviews*/ ctx[1];
    			append_dev(div10, t23);
    			append_dev(div10, label2);
    			append_dev(div13, t25);
    			append_dev(div13, div12);
    			append_dev(div12, small1);
    			append_dev(form, t27);
    			append_dev(form, div19);
    			append_dev(div19, div14);
    			append_dev(div14, label3);
    			append_dev(div19, t29);
    			append_dev(div19, div15);
    			append_dev(div15, input3);
    			set_input_value(input3, /*max_new*/ ctx[4]);
    			append_dev(div19, t30);
    			append_dev(div19, div17);
    			append_dev(div17, div16);
    			append_dev(div16, input4);
    			input4.checked = /*unlimited_new*/ ctx[2];
    			append_dev(div16, t31);
    			append_dev(div16, label4);
    			append_dev(div19, t33);
    			append_dev(div19, div18);
    			append_dev(div18, small2);
    			append_dev(div24, t35);
    			append_dev(div24, div23);
    			append_dev(div23, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "focus", /*refresh*/ ctx[10], false, false, false),
    					listen_dev(a0, "click", /*click_handler*/ ctx[13], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[14], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[15], false, false, false),
    					listen_dev(button0, "click", prevent_default(/*logout*/ ctx[8]), false, true, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[16]),
    					listen_dev(input1, "blur", /*sendSettings*/ ctx[9], false, false, false),
    					listen_dev(input2, "click", /*sendSettings*/ ctx[9], false, false, false),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[17]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[18]),
    					listen_dev(input3, "blur", /*sendSettings*/ ctx[9], false, false, false),
    					listen_dev(input4, "click", /*sendSettings*/ ctx[9], false, false, false),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[19])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*methods_promise*/ 64 && promise !== (promise = /*methods_promise*/ ctx[6]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[24] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			info_1.ctx = ctx;

    			if (dirty & /*cards_promise*/ 32 && promise_1 !== (promise_1 = /*cards_promise*/ ctx[5]) && handle_promise(promise_1, info_1)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[23] = info_1.resolved;
    				info_1.block.p(child_ctx, dirty);
    			}

    			if (!current || dirty & /*unlimited_reviews*/ 2) {
    				prop_dev(input1, "disabled", /*unlimited_reviews*/ ctx[1]);
    			}

    			if (dirty & /*max_reviews*/ 8 && to_number(input1.value) !== /*max_reviews*/ ctx[3]) {
    				set_input_value(input1, /*max_reviews*/ ctx[3]);
    			}

    			if (dirty & /*unlimited_reviews*/ 2) {
    				input2.checked = /*unlimited_reviews*/ ctx[1];
    			}

    			if (!current || dirty & /*unlimited_new*/ 4) {
    				prop_dev(input3, "disabled", /*unlimited_new*/ ctx[2]);
    			}

    			if (dirty & /*max_new*/ 16 && to_number(input3.value) !== /*max_new*/ ctx[4]) {
    				set_input_value(input3, /*max_new*/ ctx[4]);
    			}

    			if (dirty & /*unlimited_new*/ 4) {
    				input4.checked = /*unlimited_new*/ ctx[2];
    			}

    			if (dirty & /*modal_overflow*/ 1) {
    				toggle_class(div22, "overflow-visible", /*modal_overflow*/ ctx[0]);
    			}

    			if (dirty & /*modal_overflow*/ 1) {
    				toggle_class(div24, "overflow-visible", /*modal_overflow*/ ctx[0]);
    			}

    			if (dirty & /*modal_overflow*/ 1) {
    				toggle_class(div25, "overflow-visible", /*modal_overflow*/ ctx[0]);
    			}

    			if (dirty & /*modal_overflow*/ 1) {
    				toggle_class(div26, "overflow-visible", /*modal_overflow*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(methodadder.$$.fragment, local);
    			transition_in(info_1.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(methodadder.$$.fragment, local);

    			for (let i = 0; i < 3; i += 1) {
    				const block = info_1.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div26);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_component(methodadder);
    			info_1.block.d();
    			info_1.token = null;
    			info_1 = null;
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CardManager", slots, []);

    	async function getCardList() {
    		return await get("cards");
    	}

    	async function getMethodList() {
    		return await get("user/methods");
    	}

    	async function getSettings() {
    		return await get("user/settings");
    	}

    	async function deleteMethod(event) {
    		httpDel("user/methods", event.detail).then(() => refresh());
    	}

    	async function logout() {
    		post("logout").then(resp => window.location.href = "/");
    	}

    	async function sendSettings() {
    		setTimeout(
    			() => {
    				post("user/settings", {
    					max_reviews,
    					unlimited_reviews,
    					max_new,
    					unlimited_new
    				});
    			},
    			50
    		); // Wait for other values to update
    	}

    	let modal_overflow = true;
    	let unlimited_reviews = true;
    	let unlimited_new = false;
    	let max_reviews = 0;
    	let max_new = 0;

    	getSettings().then(resp => {
    		console.log("got settings:", resp);
    		$$invalidate(1, unlimited_reviews = resp.unlimited_reviews);
    		$$invalidate(2, unlimited_new = resp.unlimited_new);
    		$$invalidate(3, max_reviews = resp.max_reviews);
    		$$invalidate(4, max_new = resp.max_new);
    	});

    	let cards_promise = getCardList();
    	let methods_promise = getMethodList();

    	function refresh() {
    		$$invalidate(5, cards_promise = getCardList());
    		$$invalidate(6, methods_promise = getMethodList());
    	}

    	let card_headers = {
    		method: "Method",
    		place_bell: "Bell",
    		scheduled: "Next Review",
    		ease: "Ease"
    	};

    	let method_headers = { method: "Method", total: "Total" };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<CardManager> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, modal_overflow = true);
    	const click_handler_1 = () => $$invalidate(0, modal_overflow = false);
    	const click_handler_2 = () => $$invalidate(0, modal_overflow = false);

    	function input1_input_handler() {
    		max_reviews = to_number(this.value);
    		$$invalidate(3, max_reviews);
    	}

    	function input2_change_handler() {
    		unlimited_reviews = this.checked;
    		$$invalidate(1, unlimited_reviews);
    	}

    	function input3_input_handler() {
    		max_new = to_number(this.value);
    		$$invalidate(4, max_new);
    	}

    	function input4_change_handler() {
    		unlimited_new = this.checked;
    		$$invalidate(2, unlimited_new);
    	}

    	$$self.$capture_state = () => ({
    		get,
    		post,
    		httpDel,
    		onMount,
    		bellName,
    		SortableTable,
    		MethodAdder,
    		getCardList,
    		getMethodList,
    		getSettings,
    		deleteMethod,
    		logout,
    		sendSettings,
    		modal_overflow,
    		unlimited_reviews,
    		unlimited_new,
    		max_reviews,
    		max_new,
    		cards_promise,
    		methods_promise,
    		refresh,
    		card_headers,
    		method_headers
    	});

    	$$self.$inject_state = $$props => {
    		if ("modal_overflow" in $$props) $$invalidate(0, modal_overflow = $$props.modal_overflow);
    		if ("unlimited_reviews" in $$props) $$invalidate(1, unlimited_reviews = $$props.unlimited_reviews);
    		if ("unlimited_new" in $$props) $$invalidate(2, unlimited_new = $$props.unlimited_new);
    		if ("max_reviews" in $$props) $$invalidate(3, max_reviews = $$props.max_reviews);
    		if ("max_new" in $$props) $$invalidate(4, max_new = $$props.max_new);
    		if ("cards_promise" in $$props) $$invalidate(5, cards_promise = $$props.cards_promise);
    		if ("methods_promise" in $$props) $$invalidate(6, methods_promise = $$props.methods_promise);
    		if ("card_headers" in $$props) $$invalidate(11, card_headers = $$props.card_headers);
    		if ("method_headers" in $$props) $$invalidate(12, method_headers = $$props.method_headers);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		modal_overflow,
    		unlimited_reviews,
    		unlimited_new,
    		max_reviews,
    		max_new,
    		cards_promise,
    		methods_promise,
    		deleteMethod,
    		logout,
    		sendSettings,
    		refresh,
    		card_headers,
    		method_headers,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		input1_input_handler,
    		input2_change_handler,
    		input3_input_handler,
    		input4_change_handler
    	];
    }

    class CardManager extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardManager",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/MethodCards.svelte generated by Svelte v3.29.4 */
    const file$7 = "src/MethodCards.svelte";

    // (71:2) {#if cur_card}
    function create_if_block$5(ctx) {
    	let div;
    	let t0;
    	let button;
    	let i;
    	let t1;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*show_sidebar*/ ctx[2] && create_if_block_2$5(ctx);
    	const if_block_creators = [create_if_block_1$5, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*cur_card*/ ctx[0].id) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			button = element("button");
    			i = element("i");
    			t1 = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(i, "class", "fas");
    			toggle_class(i, "fa-chevron-up", /*show_sidebar*/ ctx[2]);
    			toggle_class(i, "fa-chevron-down", !/*show_sidebar*/ ctx[2]);
    			add_location(i, file$7, 85, 14, 2146);
    			attr_dev(button, "class", "d-md-none d-block mb-2 p-0 btn btn-outline-secondary svelte-d9x51l");
    			attr_dev(button, "id", "opener");
    			set_style(button, "width", Math.min(400, /*window_width*/ ctx[3] - 25) + "px");
    			add_location(button, file$7, 81, 6, 1899);
    			attr_dev(div, "class", "col-12 col-md-4");
    			add_location(div, file$7, 72, 4, 1720);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, button);
    			append_dev(button, i);
    			insert_dev(target, t1, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[7]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*show_sidebar*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*show_sidebar*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$5(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*show_sidebar*/ 4) {
    				toggle_class(i, "fa-chevron-up", /*show_sidebar*/ ctx[2]);
    			}

    			if (dirty & /*show_sidebar*/ 4) {
    				toggle_class(i, "fa-chevron-down", !/*show_sidebar*/ ctx[2]);
    			}

    			if (!current || dirty & /*window_width*/ 8) {
    				set_style(button, "width", Math.min(400, /*window_width*/ ctx[3] - 25) + "px");
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t1);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(71:2) {#if cur_card}",
    		ctx
    	});

    	return block;
    }

    // (76:6) {#if show_sidebar}
    function create_if_block_2$5(ctx) {
    	let div;
    	let metadata;
    	let div_transition;
    	let current;

    	metadata = new Metadata({
    			props: {
    				bumper_mode: /*cur_card*/ ctx[0].bumper_mode
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(metadata.$$.fragment);
    			add_location(div, file$7, 76, 8, 1785);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(metadata, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const metadata_changes = {};
    			if (dirty & /*cur_card*/ 1) metadata_changes.bumper_mode = /*cur_card*/ ctx[0].bumper_mode;
    			metadata.$set(metadata_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(metadata.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(metadata.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(metadata);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(76:6) {#if show_sidebar}",
    		ctx
    	});

    	return block;
    }

    // (105:4) {:else}
    function create_else_block$4(ctx) {
    	let h4;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "(No more cards today!)";
    			add_location(h4, file$7, 106, 6, 2636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(105:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (93:4) {#if cur_card.id}
    function create_if_block_1$5(ctx) {
    	let div;
    	let methoddisplay;
    	let current;
    	const methoddisplay_spread_levels = [/*cur_card*/ ctx[0], { cards_shown: /*cards_shown*/ ctx[1] }];
    	let methoddisplay_props = {};

    	for (let i = 0; i < methoddisplay_spread_levels.length; i += 1) {
    		methoddisplay_props = assign(methoddisplay_props, methoddisplay_spread_levels[i]);
    	}

    	methoddisplay = new MethodDisplay({
    			props: methoddisplay_props,
    			$$inline: true
    		});

    	methoddisplay.$on("trigger_bumper", /*trigger_bumper_handler*/ ctx[8]);
    	methoddisplay.$on("report_results", /*report_results_handler*/ ctx[9]);
    	methoddisplay.$on("done", /*getStatus*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(methoddisplay.$$.fragment);
    			attr_dev(div, "class", "col-12 col-md-3 text-center");
    			add_location(div, file$7, 94, 6, 2331);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(methoddisplay, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const methoddisplay_changes = (dirty & /*cur_card, cards_shown*/ 3)
    			? get_spread_update(methoddisplay_spread_levels, [
    					dirty & /*cur_card*/ 1 && get_spread_object(/*cur_card*/ ctx[0]),
    					dirty & /*cards_shown*/ 2 && { cards_shown: /*cards_shown*/ ctx[1] }
    				])
    			: {};

    			methoddisplay.$set(methoddisplay_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(methoddisplay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(methoddisplay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(methoddisplay);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(93:4) {#if cur_card.id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let t;
    	let cardmanager;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[6]);
    	let if_block = /*cur_card*/ ctx[0] && create_if_block$5(ctx);
    	cardmanager = new CardManager({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			create_component(cardmanager.$$.fragment);
    			attr_dev(div, "class", "row pt-4 justify-content-center justify-content-md-start");
    			add_location(div, file$7, 68, 0, 1626);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    			mount_component(cardmanager, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*onwindowresize*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*cur_card*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*cur_card*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(cardmanager.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(cardmanager.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			destroy_component(cardmanager);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $cards_today;
    	validate_store(cards_today, "cards_today");
    	component_subscribe($$self, cards_today, $$value => $$invalidate(11, $cards_today = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MethodCards", slots, []);
    	let cur_card;
    	let cards_shown = 0;

    	/* Get status, including next card if applicable */
    	async function getStatus() {
    		get("next").then(state => {
    			$$invalidate(0, cur_card = state.card);
    			set_store_value(cards_today, $cards_today = state.cards_remaining, $cards_today);
    			$$invalidate(1, cards_shown++, cards_shown);
    		});
    	}

    	/* Post results */
    	async function postResults(card_id, details) {
    		let faults = details.mistakes;

    		if (details.bumper_mode) {
    			/* don't report faults in bumper mode... */
    			faults = 0;
    		}

    		if (details.gave_up) {
    			/* ...unless we're there because the user gave up */
    			faults = 5;
    		}

    		return await post("card/" + card_id, { card_id, faults });
    	}

    	onMount(() => {
    		getStatus();
    	});

    	let show_sidebar = false;
    	let window_width;
    	let no_cards_left = false;
    	
    	
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MethodCards> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(3, window_width = window.innerWidth);
    	}

    	const click_handler = () => $$invalidate(2, show_sidebar = !show_sidebar);

    	const trigger_bumper_handler = () => {
    		$$invalidate(0, cur_card.bumper_mode = true, cur_card);
    	};

    	const report_results_handler = e => postResults(cur_card.id, e.detail);

    	$$self.$capture_state = () => ({
    		onMount,
    		slide,
    		flip,
    		MethodDisplay,
    		Card,
    		Metadata,
    		CardManager,
    		cur_blueline,
    		cur_treble,
    		cur_bell,
    		stage,
    		cur_method,
    		card_complete,
    		lead_length,
    		cards_today,
    		get,
    		post,
    		cur_card,
    		cards_shown,
    		getStatus,
    		postResults,
    		show_sidebar,
    		window_width,
    		no_cards_left,
    		$cards_today
    	});

    	$$self.$inject_state = $$props => {
    		if ("cur_card" in $$props) $$invalidate(0, cur_card = $$props.cur_card);
    		if ("cards_shown" in $$props) $$invalidate(1, cards_shown = $$props.cards_shown);
    		if ("show_sidebar" in $$props) $$invalidate(2, show_sidebar = $$props.show_sidebar);
    		if ("window_width" in $$props) $$invalidate(3, window_width = $$props.window_width);
    		if ("no_cards_left" in $$props) $$invalidate(10, no_cards_left = $$props.no_cards_left);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*cur_card*/ 1) {
    			 if (cur_card) {
    				$$invalidate(10, no_cards_left = cur_card.id == null);
    			}
    		}

    		if ($$self.$$.dirty & /*window_width, no_cards_left*/ 1032) {
    			 if (window_width > 768 || no_cards_left) {
    				$$invalidate(2, show_sidebar = true);
    			}
    		}

    		if ($$self.$$.dirty & /*window_width, no_cards_left*/ 1032) {
    			 if (window_width < 768 && !no_cards_left) {
    				$$invalidate(2, show_sidebar = false);
    			}
    		}
    	};

    	return [
    		cur_card,
    		cards_shown,
    		show_sidebar,
    		window_width,
    		getStatus,
    		postResults,
    		onwindowresize,
    		click_handler,
    		trigger_bumper_handler,
    		report_results_handler
    	];
    }

    class MethodCards extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MethodCards",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/Login.svelte generated by Svelte v3.29.4 */

    const { console: console_1$3 } = globals;
    const file$8 = "src/Login.svelte";

    // (58:4) {#if flash}
    function create_if_block$6(ctx) {
    	let strong;
    	let t;

    	const block = {
    		c: function create() {
    			strong = element("strong");
    			t = text(/*flash*/ ctx[3]);
    			attr_dev(strong, "class", "svelte-2ye12h");
    			add_location(strong, file$8, 58, 6, 838);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, strong, anchor);
    			append_dev(strong, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*flash*/ 8) set_data_dev(t, /*flash*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(strong);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(58:4) {#if flash}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div6;
    	let div5;
    	let div0;
    	let h3;
    	let t1;
    	let div4;
    	let t2;
    	let form;
    	let div1;
    	let label0;
    	let t4;
    	let input0;
    	let t5;
    	let div2;
    	let label1;
    	let t7;
    	let input1;
    	let t8;
    	let div3;
    	let input2;
    	let t9;
    	let label2;
    	let t11;
    	let button;
    	let t13;
    	let p0;
    	let t14;
    	let a0;
    	let t16;
    	let t17;
    	let p1;
    	let t18;
    	let a1;
    	let t20;
    	let mounted;
    	let dispose;
    	let if_block = /*flash*/ ctx[3] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Method Tutor";
    			t1 = space();
    			div4 = element("div");
    			if (if_block) if_block.c();
    			t2 = space();
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Email address";
    			t4 = space();
    			input0 = element("input");
    			t5 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Password";
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			div3 = element("div");
    			input2 = element("input");
    			t9 = space();
    			label2 = element("label");
    			label2.textContent = "Keep me logged in";
    			t11 = space();
    			button = element("button");
    			button.textContent = "Log In";
    			t13 = space();
    			p0 = element("p");
    			t14 = text("Log in with your ");
    			a0 = element("a");
    			a0.textContent = "Ringing Room";
    			t16 = text(" account.");
    			t17 = space();
    			p1 = element("p");
    			t18 = text("Don't have one? Click ");
    			a1 = element("a");
    			a1.textContent = "here";
    			t20 = text(".");
    			add_location(h3, file$8, 50, 6, 737);
    			attr_dev(div0, "class", "card-title text-center");
    			add_location(div0, file$8, 49, 4, 694);
    			attr_dev(label0, "for", "emailInput");
    			add_location(label0, file$8, 66, 10, 933);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "emailInput");
    			add_location(input0, file$8, 68, 10, 990);
    			attr_dev(div1, "class", "form-group");
    			add_location(div1, file$8, 64, 8, 897);
    			attr_dev(label1, "for", "passwordInput");
    			add_location(label1, file$8, 75, 10, 1146);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "passwordInput");
    			add_location(input1, file$8, 77, 10, 1201);
    			attr_dev(div2, "class", "form-group");
    			add_location(div2, file$8, 73, 8, 1110);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "class", "form-check-input");
    			attr_dev(input2, "id", "rememberCheck");
    			add_location(input2, file$8, 83, 10, 1401);
    			attr_dev(label2, "class", "form-check-label");
    			attr_dev(label2, "for", "rememberCheck");
    			add_location(label2, file$8, 85, 10, 1521);
    			attr_dev(div3, "class", "form-group form-check d-inline-block mb-0 mt-2");
    			add_location(div3, file$8, 82, 8, 1330);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "btn btn-primary float-right");
    			add_location(button, file$8, 89, 8, 1624);
    			add_location(form, file$8, 62, 6, 881);
    			attr_dev(a0, "href", "https://ringingroom.com");
    			add_location(a0, file$8, 95, 25, 1827);
    			attr_dev(p0, "class", "text-muted mb-0 mt-4");
    			add_location(p0, file$8, 94, 6, 1769);
    			attr_dev(a1, "href", "https://ringingroom.com/authenticate");
    			add_location(a1, file$8, 99, 30, 1963);
    			attr_dev(p1, "class", "text-muted mb-1");
    			add_location(p1, file$8, 98, 6, 1905);
    			attr_dev(div4, "class", "card-text");
    			add_location(div4, file$8, 55, 4, 791);
    			attr_dev(div5, "class", "card-body");
    			add_location(div5, file$8, 47, 2, 665);
    			attr_dev(div6, "class", "card svelte-2ye12h");
    			add_location(div6, file$8, 45, 0, 643);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, h3);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			if (if_block) if_block.m(div4, null);
    			append_dev(div4, t2);
    			append_dev(div4, form);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t4);
    			append_dev(div1, input0);
    			set_input_value(input0, /*email*/ ctx[0]);
    			append_dev(form, t5);
    			append_dev(form, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t7);
    			append_dev(div2, input1);
    			set_input_value(input1, /*password*/ ctx[1]);
    			append_dev(form, t8);
    			append_dev(form, div3);
    			append_dev(div3, input2);
    			input2.checked = /*remember*/ ctx[2];
    			append_dev(div3, t9);
    			append_dev(div3, label2);
    			append_dev(form, t11);
    			append_dev(form, button);
    			append_dev(div4, t13);
    			append_dev(div4, p0);
    			append_dev(p0, t14);
    			append_dev(p0, a0);
    			append_dev(p0, t16);
    			append_dev(div4, t17);
    			append_dev(div4, p1);
    			append_dev(p1, t18);
    			append_dev(p1, a1);
    			append_dev(p1, t20);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[6]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[7]),
    					listen_dev(button, "click", prevent_default(/*submit*/ ctx[4]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*flash*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(div4, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*email*/ 1 && input0.value !== /*email*/ ctx[0]) {
    				set_input_value(input0, /*email*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}

    			if (dirty & /*remember*/ 4) {
    				input2.checked = /*remember*/ ctx[2];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Login", slots, []);
    	var email;
    	var password;
    	var remember = false;
    	var flash = "";

    	async function submit() {
    		var resp = await post("login", { email, password, remember });

    		if (resp.success) {
    			window.location.href = "/";
    		} else {
    			$$invalidate(0, email = "");
    			$$invalidate(1, password = "");
    			$$invalidate(3, flash = "Email or password is incorrect.");
    			console.log("bad login");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(0, email);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	function input2_change_handler() {
    		remember = this.checked;
    		$$invalidate(2, remember);
    	}

    	$$self.$capture_state = () => ({
    		post,
    		email,
    		password,
    		remember,
    		flash,
    		submit
    	});

    	$$self.$inject_state = $$props => {
    		if ("email" in $$props) $$invalidate(0, email = $$props.email);
    		if ("password" in $$props) $$invalidate(1, password = $$props.password);
    		if ("remember" in $$props) $$invalidate(2, remember = $$props.remember);
    		if ("flash" in $$props) $$invalidate(3, flash = $$props.flash);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		email,
    		password,
    		remember,
    		flash,
    		submit,
    		input0_input_handler,
    		input1_input_handler,
    		input2_change_handler
    	];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    var main = document.querySelector('#svelte-app');

    if (main) {

        const cards = new MethodCards({
            target: main,
        });

    }

    var login = document.querySelector('#login-app');

    if (login) {
        const cards = new Login({
            target: login,
        });
    }

}());
//# sourceMappingURL=bundle.js.map
