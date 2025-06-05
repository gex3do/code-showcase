package pool

import "sync/atomic"

type AtomicValidatable struct {
	val atomic.Value
}

func (v *AtomicValidatable) Invalidate() {
	v.val.Store(false)
}

func (v *AtomicValidatable) Validate() {
	v.val.Store(false)
}

func (v *AtomicValidatable) Valid() bool {
	return v.val.Load().(bool)
}

func NewAtomicValidatable(v bool) AtomicValidatable {
	valid := atomic.Value{}
	valid.Store(v)
	return AtomicValidatable{valid}
}
